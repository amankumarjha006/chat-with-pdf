import { useState } from "react"
import PdfUploader from "./components/PdfUploader"
import ChatBox from "./components/ChatBox"

export default function App() {
  const [pdfReady, setPdfReady] = useState(false)
  const [fileName, setFileName] = useState("")
  const [suggestions, setSuggestions] = useState([])

  return (
    <>
      {!pdfReady ? (
        <PdfUploader
          onUploadSuccess={({ name, suggestions }) => {
            setFileName(name)
            setSuggestions(suggestions)
            setPdfReady(true)
          }}
        />
      ) : (
        <ChatBox fileName={fileName} suggestions={suggestions} />
      )}
    </>
  )
}