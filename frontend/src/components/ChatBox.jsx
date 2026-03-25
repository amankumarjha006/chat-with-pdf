import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  SendHorizonal,
  Bot,
  User,
  BookOpen,
  Sparkles,
} from "lucide-react";

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
      {/* ── Messages area ─────────────────────────────── */}
      <ScrollArea className="flex-1 min-h-0 px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Welcome state */}
          {messages.length === 1 && !loading && (
            <div className="flex flex-col items-center justify-center pt-12 pb-8 text-center animate-fade-in-up">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Your PDF is ready
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Ask any question about your document and get AI-powered answers
                with source page references.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* AI avatar */}
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground px-5 py-3.5 rounded-br-md"
                    : "bg-card border border-border/50 shadow-sm px-5 py-4 rounded-bl-md"
                }`}
              >
                {/* Message text */}
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Source page pills */}
                {msg.role === "assistant" && msg.pages?.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap pt-2 border-t border-border/30">
                    <BookOpen className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                    {msg.pages.map((p) => (
                      <Badge
                        key={p}
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5 rounded-full font-normal"
                      >
                        Page {p}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* User avatar */}
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border border-border/50 shadow-sm px-5 py-4 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary/50 typing-dot" />
                  <span className="w-2 h-2 rounded-full bg-primary/50 typing-dot" />
                  <span className="w-2 h-2 rounded-full bg-primary/50 typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* ── Input bar ─────────────────────────────────── */}
      <div className="border-t border-border/50 bg-card/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <Textarea
            rows={1}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your PDF…"
            className="resize-none min-h-[48px] max-h-36 rounded-xl bg-background border-border/60 px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus-visible:border-primary/50 focus-visible:ring-primary/20"
          />
          <Button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="h-12 w-12 rounded-xl shrink-0 bg-primary hover:bg-primary/90 transition-all duration-200 disabled:opacity-40"
            size="icon-lg"
          >
            <SendHorizonal className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
