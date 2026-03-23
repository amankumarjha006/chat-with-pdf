import { useState } from "react";
import PdfUploader from "./components/PdfUploader";
import ChatBox from "./components/ChatBox";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [pdfReady, setPdfReady] = useState(false);
  const [fileName, setFileName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [chunkCount, setChunkCount] = useState(0);
  const [question, setQuestion] = useState("");
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
          {/* shared navbar */}
          <div className="border-b px-6 py-3 flex items-center justify-between shrink-0 min-h-10">
            <div>
              <h1 className="text-base font-semibold">Chat with PDF</h1>
              <p className="text-xs text-muted-foreground">
                Powered by RAG + Groq
              </p>
            </div>
            <div className="flex items-center gap-3">
              {pdfReady && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">
                    llama-3.3-70b-versatile
                  </span>
                </div>
              )}
              <span className="text-xs text-muted-foreground">{fileName}</span>
            </div>
          </div>

          {/* sidebar + chatbox */}
          <div className="flex flex-1 min-h-0">
            <Sidebar
              fileName={fileName}
              chunkCount={chunkCount}
              suggestions={suggestions}
              onSuggestionClick={(q) => setQuestion(q)}
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
