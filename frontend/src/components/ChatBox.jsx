import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export default function ChatBox({ fileName, suggestions = [] }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "PDF is ready! Ask me anything about it."
    }
  ])
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleAsk() {
    if (!question.trim() || loading) return

    const userMessage = { role: "user", text: question }
    setMessages(prev => [...prev, userMessage])
    setQuestion("")
    setLoading(true)

    try {
      const res = await axios.post("http://localhost:8000/ask", {
        question: userMessage.text
      })
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: res.data.answer }
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "Something went wrong. Please try again." }
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">

      {/* header */}
      <div className="border-b px-6 py-4 flex items-center justify-between ">
        <div>
          <h1 className="text-base font-semibold">Chat with PDF</h1>
          <p className="text-xs text-muted-foreground">Powered by RAG + Groq</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {fileName || "Document ready"}
        </Badge>
      </div>

      {/* messages */}
      <ScrollArea className="flex-1 min-h-0 px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground px-4 py-3 rounded-2xl rounded-bl-sm text-sm">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 pb-2">
          <div className="max-w-2xl mx-auto flex gap-2 flex-wrap">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setQuestion(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* input */}
      <div className="border-t px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-2 items-end">
          <Textarea
            rows={1}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the PDF... (Enter to send)"
            className="resize-none min-h-[44px] max-h-32"
          />
          <Button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="h-11 px-6"
          >
            Send
          </Button>
        </div>
      </div>

    </div>
  )
}