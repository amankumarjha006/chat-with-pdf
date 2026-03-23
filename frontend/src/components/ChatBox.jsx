import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function ChatBox({ fileName, question, setQuestion }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "PDF is ready! Ask me anything about it.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleAsk() {
    if (!question.trim() || loading) return;

    const userMessage = { role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/ask", {
        question: userMessage.text,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.data.answer, pages: res.data.pages },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* messages */}
      <ScrollArea className="flex-1 min-h-0 px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* AI avatar — only show for assistant */}
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                  AI
                </div>
              )}

              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {msg.text}

                {/* source pills */}
                {msg.role === "assistant" && msg.pages?.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {msg.pages.map((p) => (
                      <span
                        key={p}
                        className="text-xs px-2 py-0.5 rounded-full border border-border bg-background text-muted-foreground"
                      >
                        Page {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* User avatar — only show for user */}
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground shrink-0">
                  U
                </div>
              )}
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

      {/* input */}
      <div className="border-t px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-2 items-end">
          <Textarea
            rows={1}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
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
  );
}
