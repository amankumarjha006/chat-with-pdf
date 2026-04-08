import { useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/api";
import PdfUploader from "./components/PDFUploader";
import ChatBox from "./components/ChatBox";
import Sidebar, { MobileSidebarToggle } from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function App() {
  const [pdfReady, setPdfReady] = useState(false);
  const [fileName, setFileName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [chunkCount, setChunkCount] = useState(0);
  const [question, setQuestion] = useState("");
  const [refreshingSuggestions, setRefreshingSuggestions] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleRefreshSuggestions() {
    setRefreshingSuggestions(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/suggestions`);
      if (res.data.suggestions?.length) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      console.log("Failed to refresh suggestions:", err);
    } finally {
      setRefreshingSuggestions(false);
    }
  }

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
          {/* ── Navbar ─────────────────────────────────────── */}
          <header className="header-glass h-13 px-3 md:px-5 flex items-center justify-between shrink-0 z-10">
            {/* Left — hamburger + branding */}
            <div className="flex items-center gap-2 md:gap-3">
              <MobileSidebarToggle onClick={() => setMobileOpen(true)} />
              <div className="w-8 h-8 rounded-lg bg-primary/12 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="leading-tight">
                <p className="text-[13px] font-semibold text-foreground tracking-tight">
                  Chat with PDF
                </p>
                <p className="text-[10px] text-muted-foreground hidden sm:block">
                  RAG · Groq · FAISS
                </p>
              </div>
            </div>

            {/* Right — status pills + toggle */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <Badge
                variant="outline"
                className="text-[10px] gap-1.5 px-2.5 py-1 rounded-full border-primary/20 text-primary bg-primary/5 font-medium hidden sm:inline-flex"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                llama-3.3-70b
              </Badge>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1.5 rounded-full max-w-[120px] md:max-w-[160px]">
                <FileText className="w-3 h-3 shrink-0" />
                <span className="truncate font-medium">{fileName}</span>
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* ── Content ────────────────────────────────────── */}
          <div className="flex flex-1 min-h-0">
            <Sidebar
              fileName={fileName}
              chunkCount={chunkCount}
              suggestions={suggestions}
              onSuggestionClick={(q) => setQuestion(q)}
              onReset={handleReset}
              onRefreshSuggestions={handleRefreshSuggestions}
              refreshingSuggestions={refreshingSuggestions}
              mobileOpen={mobileOpen}
              onMobileOpenChange={setMobileOpen}
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