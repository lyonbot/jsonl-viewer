import { useAppState } from "@/hooks/use-ndjson-store";

export function ParseProgress() {
  const { isLoading, parseProgress, lines } = useAppState();
  if (!isLoading) return null;

  const pct = Math.round(parseProgress * 100);

  return (
    <div className="px-4 py-2 border-b">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
        <span>Parsing... {lines.length.toLocaleString()} lines</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-[width] duration-150 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
