import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";
import {
  FileText,
  CheckCircle2,
  Layers,
  Sparkles,
  MessageCircle,
} from "lucide-react";

export default function Sidebar({
  fileName,
  chunkCount,
  suggestions,
  onSuggestionClick,
  onReset, 
}) {
  return (
    <div className="w-80 border-r border-border/50 flex flex-col h-full overflow-hidden bg-muted/20">
      {/* ── Document info ─────────────────────────────── */}
      <div className="p-5">
        <Card className="rounded-xl border-border/50 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-foreground">
                  {fileName}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <Layers className="w-3 h-3" />
                  {chunkCount} chunks indexed
                </div>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="text-green-600 bg-green-50 border-green-200 gap-1.5 rounded-full px-2.5 py-0.5"
            >
              <CheckCircle2 className="w-3 h-3" />
              Ready
            </Badge>
          </CardContent>
        </Card>
        
        <Button
          variant="outline"
          className="w-full text-xs mt-3"
          onClick={onReset}
        >
          Upload new PDF
        </Button>

      </div>

      <Separator className="opacity-50" />

      {/* ── Suggested questions ────────────────────────── */}
      <div className="p-5 flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Suggested questions
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick(s)}
              className="group flex items-start gap-2.5 text-xs text-left px-3.5 py-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-sm transition-all duration-200"
            >
              <Sparkles className="w-3 h-3 text-primary/50 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
              <span className="text-foreground/80 group-hover:text-foreground transition-colors leading-relaxed">
                {s}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
