import { useState, useRef, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { SendHorizonal, Bot, User, BookOpen, Sparkles } from "lucide-react";

export default function ChatBox({ fileName, question, setQuestion }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "PDF is ready! Ask me anything about it." },
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
      const res = await axios.post(`${API_BASE_URL}/ask`, {
        question: userMessage.text,
      });
      const { answer, sources, status, message } = res.data;

      if (status === "not_found") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: message || "Answer not found in the document." },
        ]);
      } else if (status === "error") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: message || "An error occurred." },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: answer, pages: sources },
        ]);
      }
    } catch {
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

  const isWelcome = messages.length === 1 && !loading;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* ── Messages ──────────────────────────────────── */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-[680px] mx-auto px-3 md:px-6 py-5 md:py-8 space-y-4 md:space-y-5">

          {/* Welcome state */}
          {isWelcome && (
            <div className="flex flex-col items-center justify-center pt-16 pb-8 text-center animate-fade-in-up">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 animate-float">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-[17px] font-semibold text-foreground mb-2">
                Ready to answer questions
              </h2>
              <p className="text-[13px] text-muted-foreground max-w-[300px] leading-relaxed">
                Ask anything about your document. Answers include the source
                pages they came from.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-fade-in-up ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
              style={{ animationDelay: "0ms", animationDuration: "0.3s" }}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[78%] rounded-2xl text-[13px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground px-4 py-3 rounded-br-md"
                    : "msg-ai px-4 py-3.5 rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Source pills */}
                {msg.role === "assistant" && msg.pages?.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-border/30 flex-wrap">
                    <BookOpen className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                    {msg.pages.map((p) => (
                      <Badge
                        key={p}
                        variant="secondary"
                        className="text-[10px] px-2 py-0 rounded-full font-normal h-4"
                      >
                        p.{p}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-1">
                  <User className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3 justify-start animate-fade-in-up">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="msg-ai px-4 py-3.5 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* ── Input bar ─────────────────────────────────── */}
      <div className="border-t border-border/50 px-3 md:px-6 py-3 md:py-4 bg-card/40 backdrop-blur-sm">
        <div className="max-w-[680px] mx-auto flex gap-2.5 items-end">
          <Textarea
            rows={1}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your PDF… (Enter to send)"
            className="resize-none min-h-[44px] max-h-32 rounded-xl bg-background border-border/70 px-4 py-3 text-[13px] placeholder:text-muted-foreground/50 focus-visible:border-primary/50 focus-visible:ring-primary/15 input-glow"
          />
          <Button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="h-11 w-11 rounded-xl shrink-0 bg-primary hover:bg-primary/90 disabled:opacity-30"
            size="icon"
          >
            <SendHorizonal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}