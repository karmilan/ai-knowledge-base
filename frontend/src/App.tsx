import type { FormEvent } from 'react'
import { useState } from 'react'
import './App.css'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Upload a PDF and then ask questions about it.',
    },
  ])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([])

  async function handleUpload(event: FormEvent) {
    event.preventDefault()
    if (!selectedFile) {
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.filename) {
        setUploadedDocs((current) => {
          if (current.includes(data.filename)) {
            return current
          }
          return [...current, data.filename]
        })
      }
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: data.message || 'Upload complete.',
        },
      ])
      setSelectedFile(null)
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Upload failed.',
        },
      ])
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) {
      return
    }

    const nextMessages: Message[] = [...messages, { role: 'user', content: trimmedQuestion }]
    setMessages(nextMessages)
    setQuestion('')
    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: trimmedQuestion, session_id: 'frontend-chat' }),
      })

      if (!response.ok) {
        throw new Error('The backend could not answer the question.')
      }

      const data = await response.json()
      setMessages([
        ...nextMessages,
        { role: 'assistant', content: data.response || 'No answer was returned.' },
      ])
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Something went wrong while contacting the backend.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="chat-card">
        <header className="chat-header">
          <div>
            <p className="eyebrow">Document QA</p>
            <h1>Chat with your knowledge base</h1>
          </div>
          <span className="status-pill">Live</span>
        </header>

        <section className="document-list" aria-label="Uploaded documents">
          <h2>Uploaded documents</h2>
          {uploadedDocs.length === 0 ? (
            <p className="empty-state">No documents uploaded yet.</p>
          ) : (
            <ul>
              {uploadedDocs.map((doc) => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
          )}
        </section>

        <div className="message-list" role="log" aria-live="polite">
          {messages.map((message, index) => (
            <article key={`${message.role}-${index}`} className={`message ${message.role}`}>
              <strong>{message.role === 'user' ? 'You' : 'Assistant'}</strong>
              <p>{message.content}</p>
            </article>
          ))}
          {loading && (
            <article className="message assistant">
              <strong>Assistant</strong>
              <p>Thinking…</p>
            </article>
          )}
        </div>

        <form className="composer" onSubmit={handleUpload}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />
          <button type="submit" disabled={uploading || !selectedFile}>
            {uploading ? 'Uploading…' : 'Upload PDF'}
          </button>
        </form>

        <form className="composer" onSubmit={handleSubmit}>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about the document..."
            rows={3}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send question'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default App
