# Backend

Backend service for the AI Knowledge Base. It uses FastAPI, Chroma, HuggingFace embeddings, LangGraph, and Groq to answer questions from a resume PDF.

## What it does

- Loads `backend/app/data/Karmilan_Software_Engineer_Resume.pdf`.
- Splits the PDF into chunks and indexes it with Chroma.
- Uses a Groq-powered language model for question answering via a LangGraph workflow.
- Exposes a single FastAPI endpoint: `POST /ask`.

## Requirements

- Python 3.13+
- Dependencies declared in `backend/pyproject.toml`
- A `.env` file in `backend/` containing `GROQ_API_KEY`

## Setup

1. Navigate to the `backend/` folder.
2. Create and activate a virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. Install the Python dependencies.

## Running the service

- Start the API with:
  ```powershell
  python main.py
  ```
- Or run with Uvicorn directly:
  ```powershell
  uvicorn app.app:app --reload --port 8000
  ```

## API Endpoint

- `POST /ask`
  - Body: `question` (string)
  - Returns: JSON response from the model

## Testing

- Run tests from the `backend/` directory with:
  ```powershell
  pytest
  ```
