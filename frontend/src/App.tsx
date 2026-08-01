import { FormEvent, useState } from 'react'
import './App.css'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Ask me anything about the uploaded document and I will answer from the indexed content.',
    },
  ])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)

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
