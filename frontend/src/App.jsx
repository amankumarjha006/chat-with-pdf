import { useState } from "react";
import PdfUploader from "./components/PdfUploader";
import ChatBox from "./components/ChatBox";
import Sidebar from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle";
import { FileText, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function App() {
  const [pdfReady, setPdfReady] = useState(false);
  const [fileName, setFileName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [chunkCount, setChunkCount] = useState(0);
  const [question, setQuestion] = useState("");

  function handleReset() {
    setPdfReady(false);
    setFileName("");
    setSuggestions([]);
    setChunkCount(0);
    setQuestion("");
  }

  return (
    <>
      {!pdfReady ? (
        <PdfUploader
          onUploadSuccess={({ name, suggestions, chunkCount }) => {
            setFileName(name);
            setSuggestions(suggestions);
            setChunkCount(chunkCount);
            setPdfReady(true);
          }}
        />
      ) : (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
          {/* ── Navbar ────────────────────────────────────── */}
          <div className="h-14 border-b border-border/50 px-5 flex items-center justify-between shrink-0 bg-card/70 backdrop-blur-md">
            {/* Left — Logo + Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
                <FileText className="w-[18px] h-[18px] text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-foreground leading-tight">
                  Chat with PDF
                </h1>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Powered by RAG + Groq
                </p>
              </div>
            </div>

            {/* Right — Status + Actions */}
            <div className="flex items-center gap-3">
              {pdfReady && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium gap-1.5 px-2.5 py-1 rounded-full border-border/60"
                >
                  <Zap className="w-3 h-3 text-primary" />
                  llama-3.3-70b-versatile
                </Badge>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                <FileText className="w-3 h-3" />
                <span className="truncate max-w-[140px] font-medium">
                  {fileName}
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* ── Content — Sidebar + Chat ──────────────────── */}
          <div className="flex flex-1 min-h-0">
            <Sidebar
              fileName={fileName}
              chunkCount={chunkCount}
              suggestions={suggestions}
              onSuggestionClick={(q) => setQuestion(q)}
              onReset={handleReset}
            />
            <div className="flex-1 min-w-0">
              <ChatBox
                fileName={fileName}
                question={question}
                setQuestion={setQuestion}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
