# AI Knowledge Base

This repository contains an AI knowledge base project with a Python backend and a placeholder frontend.

## Repository structure

- `backend/` — Python FastAPI backend using LangChain, Groq, Chroma, and PDF loaders.
- `frontend/` — frontend project folder (currently empty).

## Backend

The backend service starts from `backend/main.py` and exposes a FastAPI app in `backend/app/app.py`.

### Setup

1. Open a terminal and navigate to `backend/`.
2. Create a virtual environment:
   ```powershell
   python -m venv .venv
   ```
3. Activate the virtual environment:
   - PowerShell: `.\.venv\Scripts\Activate.ps1`
   - CMD: `.\.venv\Scripts\activate.bat`
4. Install dependencies. The package information is declared in `backend/pyproject.toml`.
   Example:
   ```powershell
   python -m pip install --upgrade pip
   python -m pip install fastapi uvicorn langchain chromadb langchain-community langchain-groq langgraph pandas pypdf sentence-transformers
   ```
5. Create a `.env` file inside `backend/` with the following value:
   ```text
   GROQ_API_KEY=your_groq_api_key_here
   ```

### Run

- Start the API with:
  ```powershell
  python main.py
  ```
- Or use Uvicorn directly:
  ```powershell
  uvicorn app.app:app --reload --port 8000
  ```

### API

- `POST /ask`
  - Request body: `question` (string)
  - Response: JSON containing `response`

## Notes

- The backend loads `backend/app/data/Karmilan_Software_Engineer_Resume.pdf` and indexes it at runtime.
- Temporary Chroma data is created at runtime and should not be committed to source control.
