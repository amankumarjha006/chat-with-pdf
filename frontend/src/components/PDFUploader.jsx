import { useState } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ThemeToggle from "./ThemeToggle"
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BrainCircuit,
  Layers,
  BookOpen,
  Sparkles,
} from "lucide-react"

export default function PdfUploader({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(null)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  async function handleUpload(file) {
    if (!file || file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.")
      return
    }

    document.getElementById("pdf-input").value = ""

    setSelectedFile(file)
    const formData = new FormData()
    formData.append("file", file)

    setUploading(true)
    setError(null)

    try {
      const res = await axios.post("http://localhost:8000/upload", formData)
      setUploaded(res.data)
      onUploadSuccess({
        name: file.name,
        suggestions: res.data.suggestions,
        chunkCount: res.data.chunk_count,
      })
    } catch (err) {
      console.log("Error:", err)
      console.log("Error response:", err.response)
      setError("Upload failed. Make sure the backend is running.")
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleUpload(file)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background bg-grid-pattern p-6 relative overflow-hidden">
      {/* Theme toggle — top right */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute top-[-25%] left-[-15%] w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-25%] right-[-15%] w-[500px] h-[500px] rounded-full bg-primary/[0.05] blur-[100px]" />
      <div className="pointer-events-none absolute top-[30%] right-[10%] w-[200px] h-[200px] rounded-full bg-primary/[0.03] blur-[60px]" />

      <div className="w-full max-w-xl space-y-10 animate-fade-in-up relative z-10">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 mb-1 shadow-sm">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Chat with PDF
          </h1>
          <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
            Upload a document and start asking questions — powered by AI
          </p>
          <Badge
            variant="secondary"
            className="text-xs font-medium px-3 py-1.5 gap-1.5 rounded-full"
          >
            <Sparkles className="w-3 h-3" />
            RAG + Groq · llama-3.3-70b
          </Badge>
        </div>

        {/* ── Upload Card with gradient glow ───────────── */}
        <div className="gradient-glow rounded-2xl">
          <Card className="rounded-2xl shadow-xl shadow-primary/[0.05] border-border/50 bg-card/90 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Drop zone */}
              <div
                className={`
                  group relative cursor-pointer rounded-xl border-2 border-dashed
                  transition-all duration-300 ease-out
                  ${
                    dragOver
                      ? "border-primary bg-primary/[0.06] scale-[1.01]"
                      : "border-border/70 hover:border-primary/40 hover:bg-primary/[0.02]"
                  }
                  ${uploading ? "pointer-events-none" : ""}
                `}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() =>
                  !uploading && document.getElementById("pdf-input").click()
                }
              >
                <div className="flex flex-col items-center justify-center py-16 gap-5 px-6">
                  {/* Icon */}
                  {uploading ? (
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin-slow" />
                    </div>
                  ) : (
                    <div
                      className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center
                        transition-all duration-300
                        ${
                          dragOver
                            ? "bg-primary/15 scale-110 animate-pulse-ring"
                            : "bg-primary/10 group-hover:bg-primary/15 animate-float"
                        }
                      `}
                    >
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                  )}

                  {/* Text */}
                  <div className="text-center space-y-1.5">
                    {uploading ? (
                      <>
                        <p className="text-sm font-semibold text-foreground">
                          Processing your document…
                        </p>
                        {selectedFile && (
                          <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-muted-foreground">
                            <FileText className="w-3.5 h-3.5" />
                            {selectedFile.name}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-base font-semibold text-foreground">
                          {dragOver
                            ? "Release to upload"
                            : "Drag & drop your PDF here"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or click to browse · PDF up to 50 MB
                        </p>
                      </>
                    )}
                  </div>

                  {/* Shimmer overlay during upload */}
                  {uploading && (
                    <div className="absolute inset-0 rounded-xl animate-shimmer" />
                  )}
                </div>

                <input
                  id="pdf-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files[0])}
                  disabled={uploading}
                />
              </div>

              {/* Success state */}
              {uploaded && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  <Badge
                    variant="secondary"
                    className="text-green-600 bg-green-50 border-green-200 gap-1.5 px-3 py-1.5 rounded-full"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {uploaded.chunk_count} chunks indexed
                  </Badge>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="flex items-center justify-center gap-2 mt-5 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Feature badges ─────────────────────────────── */}
        <div className="flex items-center justify-center gap-8 text-muted-foreground">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <span className="font-medium">Smart Chunking</span>
          </div>
          <div className="w-px h-5 bg-border/60" />
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
              <BrainCircuit className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <span className="font-medium">AI-Powered Q&A</span>
          </div>
          <div className="w-px h-5 bg-border/60" />
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <span className="font-medium">Source Pages</span>
          </div>
        </div>
      </div>
    </div>
  )
}