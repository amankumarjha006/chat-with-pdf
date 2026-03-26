import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle2,
  Layers,
  Sparkles,
  MessagesSquare,
  RefreshCw,
} from "lucide-react";

export default function Sidebar({
  fileName,
  chunkCount,
  suggestions,
  onSuggestionClick,
  onReset,
}) {
  return (
    <aside className="sidebar-glass w-72 border-r border-border/60 flex flex-col h-full overflow-hidden">
      {/* ── Document card ─────────────────────────────── */}
      <div className="p-4 space-y-3">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/70 px-1">
          Document
        </p>

        <Card className="rounded-xl border-primary/10 shadow-none bg-card/80">
          <CardContent className="p-3.5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[13px] font-semibold truncate text-foreground leading-tight">
                  {fileName}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
                  <Layers className="w-3 h-3" />
                  <span>{chunkCount} chunks</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="text-[10px] gap-1 rounded-full px-2 py-0.5 text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                Indexed & ready
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          size="sm"
          className="w-full text-[11px] gap-1.5 rounded-lg h-8 border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/30"
          onClick={onReset}
        >
          <RefreshCw className="w-3 h-3" />
          Upload new PDF
        </Button>
      </div>

      <Separator className="opacity-40" />

      {/* ── Suggested questions ────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        <div className="flex items-center gap-1.5 px-1">
          <MessagesSquare className="w-3 h-3 text-muted-foreground/70" />
          <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/70">
            Suggested
          </p>
        </div>

        <div className="space-y-1.5">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick(s)}
              className="group w-full flex items-start gap-2.5 text-[12px] text-left px-3 py-2.5 rounded-lg border border-border/50 bg-card/60 hover:border-primary/30 hover:bg-primary/[0.04] hover:shadow-sm transition-all duration-150"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Sparkles className="w-3 h-3 text-primary/40 group-hover:text-primary shrink-0 mt-0.5 transition-colors duration-150" />
              <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-150 leading-snug">
                {s}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-border/40">
        <p className="text-[10px] text-muted-foreground/50 text-center">
          Answers grounded in your document only
        </p>
      </div>
    </aside>
  );
}