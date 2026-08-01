import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from config import settings
import os
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
import pandas as pd
import tempfile
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, MessagesState, StateGraph

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_resume_path() -> Path:
    return (Path(__file__).resolve().parent / "data" / "Karmilan_Software_Engineer_Resume.pdf").resolve()


loader = PyPDFLoader(str(get_resume_path()))
pdf_pages = loader.load()

all_minilm_embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
)

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
chunked_doc = text_splitter.split_documents(pdf_pages)

persistent_directory = tempfile.mkdtemp(prefix="chroma_db_")

vectordb = Chroma.from_documents(
    documents=chunked_doc,
    embedding=all_minilm_embeddings,
    persist_directory=persistent_directory,
)


# Groq

if "GROQ_API_KEY" not in os.environ:
    os.environ["GROQ_API_KEY"] = settings.groq_api_key

# Initialize the ChatGroq model

def get_chat_model():
    """Caches the ChatGroq model."""
    return ChatGroq(
        model="llama-3.1-8b-instant",
        temperature=0,
        max_tokens=250,
    )

model = get_chat_model()


# Memory

def call_model(state: MessagesState):
    system_prompt = (
        "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question."
        "If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise."
        "Answer all questions to the best of your ability."
    )
    messages = [SystemMessage(content=system_prompt)] + state["messages"]
    response = model.invoke(messages)
    return {"messages": [response]}

# Build and compile the LangGraph workflow
def get_langgraph_app():
    """Caches and compiles the LangGraph workflow."""
    workflow = StateGraph(state_schema=MessagesState)
    workflow.add_node("model", call_model)
    workflow.add_edge(START, "model")

    memory = MemorySaver()
    compiled_workflow = workflow.compile(checkpointer=memory)
    return compiled_workflow

compiled_workflow = get_langgraph_app()

class AskRequest(BaseModel):
    question: str
    session_id: str = "default"


def extract_message_text(response: dict) -> str:
    messages = response.get("messages", [])
    if not messages:
        return "I could not generate a response."

    for message in reversed(messages):
        content = getattr(message, "content", None)
        if isinstance(content, str) and content.strip():
            return content.strip()

    return "I could not generate a response."


@app.post("/ask")
def ask_question(request: AskRequest):
    question = request.question
    docs = vectordb.similarity_search_with_score(question, k=2)

    _docs = pd.DataFrame(
        [
            (
                question,
                doc[0].page_content,
                doc[0].metadata.get('source'),
                doc[1],
            )
            for doc in docs
        ],
        columns=['query', 'paragraph', 'document', 'relevant_score'],
    )

    context = "\n\n".join(_docs['paragraph'])

    human_message = [
        HumanMessage(content=f"Context:\n{context}\n\nQuestion:\n{question}")
    ]

    response = compiled_workflow.invoke(
        {"messages": human_message},
        config={"configurable": {"thread_id": request.session_id}},
    )

    return {
        "response": extract_message_text(response),
    }