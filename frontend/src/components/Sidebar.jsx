import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function Sidebar({
  fileName,
  chunkCount,
  suggestions,
  onSuggestionClick,
}) {
  return (
    <div className="w-84 border-r flex flex-col h-full overflow-hidden bg-muted/30">

      {/* document card — fill this in */}
      <div className="p-4">
        <Card>
          <CardContent className="p-3 space-y-2">
            <p className="text-sm font-medium truncate">{fileName}</p>
            <p className="text-xs text-muted-foreground">
              {chunkCount} chunks indexed
            </p>
            <Badge
              variant="secondary"
              className="text-green-600 bg-green-50 border-green-200"
            >
              Ready
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* suggestions — fill this in */}
      <div className="p-4 flex flex-col gap-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Suggested questions
        </p>
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(s)}
            className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-left"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
