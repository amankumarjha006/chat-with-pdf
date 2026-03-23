import { useState } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PdfUploader({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(null)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  async function handleUpload(file) {
    if (!file || file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.")
      return
    }

    // reset the input so the same file can be reselected
    document.getElementById("pdf-input").value = ""

    const formData = new FormData()
    formData.append("file", file)

    setUploading(true)
    setError(null)

    try {
      const res = await axios.post("http://localhost:8000/upload", formData)
      setUploaded(res.data)
      onUploadSuccess({ name: file.name, suggestions: res.data.suggestions, chunkCount: res.data.chunk_count })
    } catch (err) {
        console.log("Error:", err)        // ← add this
        console.log("Error response:", err.response)  // ← and this
        setError("Upload failed. Make sure the backend is running.")
    }finally {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6">

        {/* header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Chat with PDF</h1>
          <p className="text-muted-foreground text-sm">
            Upload a PDF and ask questions about it
          </p>
        </div>

        {/* drop zone */}
        <Card
          className={`border-2 border-dashed cursor-pointer transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("pdf-input").click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium">
                {uploading ? "Uploading..." : "Drop your PDF here"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>

            <input
              id="pdf-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files[0])}
              disabled={uploading}
            />
          </CardContent>
        </Card>

        {/* success state */}
        {uploaded && (
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="text-green-600 bg-green-50 border-green-200">
              ✓ {uploaded.chunk_count} chunks indexed
            </Badge>
          </div>
        )}

        {/* error state */}
        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

      </div>
    </div>
  )
}