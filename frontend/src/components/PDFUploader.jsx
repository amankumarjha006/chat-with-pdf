import { useState } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ThemeToggle from "./ThemeToggle"
import API_BASE_URL from "@/api"
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
      const res = await axios.post(`${API_BASE_URL}/upload`, formData)
      const data = res.data

      if (data.status === "error") {
        setError(data.message || "Upload failed.")
        return
      }

      setUploaded(data)
      onUploadSuccess({
        name: file.name,
        suggestions: data.suggestions || [],
        chunkCount: data.chunk_count,
      })
    } catch (err) {
      console.log("Error:", err)
      setError("Upload failed. Make sure the backend is running.")
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files[0])
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden p-6">

      {/* Theme toggle */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Ambient orbs */}
      <div className="orb orb-primary absolute w-[560px] h-[560px] top-[-20%] left-[-10%]" />
      <div className="orb orb-secondary absolute w-[400px] h-[400px] bottom-[-20%] right-[-10%]" />

      {/* Subtle grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[440px] space-y-9 animate-fade-in-up">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-[60px] h-[60px] rounded-2xl bg-primary/10 mb-1">
            <FileText className="w-7 h-7 text-primary animate-float" />
          </div>
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-foreground leading-tight">
              Chat with PDF
            </h1>
            <p className="text-[14px] text-muted-foreground mt-2 max-w-[320px] mx-auto leading-relaxed">
              Upload any document and get instant AI-powered answers
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-[11px] font-medium px-3 py-1.5 gap-1.5 rounded-full border-primary/25 text-primary bg-primary/5"
          >
            <Sparkles className="w-3 h-3" />
            RAG · Groq · llama-3.3-70b
          </Badge>
        </div>

        {/* Upload card */}
        <div className="gradient-glow rounded-2xl">
          <Card className="rounded-2xl border-border/50 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur-sm">
            <CardContent className="p-6">
              {/* Drop zone */}
              <div
                className={`
                  relative cursor-pointer rounded-xl border-2 border-dashed
                  transition-all duration-250
                  ${dragOver
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border/60 hover:border-primary/40 hover:bg-primary/[0.02]"
                  }
                  ${uploading ? "pointer-events-none" : ""}
                `}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && document.getElementById("pdf-input").click()}
              >
                <div className="flex flex-col items-center justify-center py-14 px-6 gap-5">

                  {/* Icon */}
                  {uploading ? (
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Loader2 className="w-7 h-7 text-primary animate-spin-slow" />
                    </div>
                  ) : (
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center
                      ${dragOver
                        ? "bg-primary/15 animate-pulse-ring"
                        : "bg-primary/8 group-hover:bg-primary/12 animate-float"
                      }
                    `}>
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                  )}

                  {/* Label */}
                  <div className="text-center space-y-1">
                    {uploading ? (
                      <>
                        <p className="text-[14px] font-semibold text-foreground">
                          Processing document…
                        </p>
                        {selectedFile && (
                          <p className="text-[12px] text-muted-foreground flex items-center justify-center gap-1.5 mt-1">
                            <FileText className="w-3 h-3" />
                            {selectedFile.name}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-[14px] font-semibold text-foreground">
                          {dragOver ? "Drop to upload" : "Drag & drop your PDF"}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          or click to browse — PDF only
                        </p>
                      </>
                    )}
                  </div>

                  {/* Shimmer */}
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

              {/* Success */}
              {uploaded && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Badge
                    variant="secondary"
                    className="text-[11px] gap-1.5 px-3 py-1.5 rounded-full text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {uploaded.chunk_count} chunks indexed
                  </Badge>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center justify-center gap-2 mt-4 text-[12px] text-destructive">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feature row */}
        <div className="flex items-center justify-center gap-7 text-muted-foreground">
          {[
            { icon: Layers, label: "Smart chunking" },
            { icon: BrainCircuit, label: "AI answers" },
            { icon: BookOpen, label: "Source pages" },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <div className="w-6 h-6 rounded-md bg-primary/8 flex items-center justify-center">
                <Icon className="w-3 h-3 text-primary/60" />
              </div>
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}