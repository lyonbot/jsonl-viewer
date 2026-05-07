import { memo } from "react";
import { useMemoizedFn } from "ahooks";
import { highlightWithSearch } from "@/lib/json-syntax";
import { JsonTree } from "./JsonTree";
import type { NdjsonLine } from "@/lib/types";

interface LineRowProps {
  line: NdjsonLine;
  lineIndex: number;
  isExpanded: boolean;
  isJoraExpanded: boolean;
  searchQuery: string;
  joraResult?: unknown | null;
  hasJora: boolean;
  onToggleRaw: (index: number) => void;
  onToggleJora: (index: number) => void;
}

export const LineRow = memo(function LineRow({
  line,
  lineIndex,
  isExpanded,
  isJoraExpanded,
  searchQuery,
  joraResult,
  hasJora,
  onToggleRaw,
  onToggleJora,
}: LineRowProps) {
  const handleClickRaw = useMemoizedFn(() => onToggleRaw(lineIndex));
  const handleClickJora = useMemoizedFn(() => onToggleJora(lineIndex));
  return (
    <div
      className={`grid font-mono text-xs border-b border-border/50 ${
        line.error ? "bg-destructive/5" : ""
      }`}
      style={{
        gridTemplateColumns: hasJora
          ? "var(--col-seq) var(--col-raw) var(--col-jora)"
          : "var(--col-seq) var(--col-raw)",
      }}
    >
      {/* Column 1: Row number */}
      <div className="text-muted-foreground select-none text-right tabular-nums px-2 py-1.5 border-r border-border/30">
        {line.index + 1}
      </div>

      {/* Column 2: Raw data */}
      <div className="flex flex-col min-w-0 border-r border-border/30">
        <button
          type="button"
          className={`text-left px-3 py-1.5 truncate hover:bg-accent/50 cursor-pointer transition-colors w-full ${
            isExpanded ? "bg-accent/30" : ""
          }`}
          onClick={handleClickRaw}
        >
          <span className="truncate min-w-0">
            {highlightWithSearch(line.raw, searchQuery)}
          </span>
        </button>
        {isExpanded && (
          <div className="px-3 py-2 bg-muted/50 border-t border-muted overflow-x-auto">
            {line.error ? (
              <div>
                <span className="text-destructive font-semibold">
                  Parse error:{" "}
                </span>
                <span className="text-destructive">{line.error}</span>
                <pre className="mt-1 text-muted-foreground whitespace-pre-wrap">
                  {line.raw}
                </pre>
              </div>
            ) : (
              <JsonTree data={line.parsed} />
            )}
          </div>
        )}
      </div>

      {/* Column 3: Jora result (only when jora is active) */}
      {hasJora && (
        <div className="flex flex-col min-w-0">
          <button
            type="button"
            className={`text-left px-3 py-1.5 truncate hover:bg-accent/50 cursor-pointer transition-colors w-full ${
              isJoraExpanded ? "bg-accent/30" : ""
            }`}
            onClick={handleClickJora}
          >
            <span className="truncate min-w-0 text-muted-foreground">
              {joraResult != null ? formatPreview(joraResult) : "—"}
            </span>
          </button>
          {isJoraExpanded && joraResult != null && (
            <div className="px-3 py-2 bg-muted/50 border-t border-muted overflow-x-auto">
              <JsonTree data={joraResult} />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

function formatPreview(data: unknown): string {
  try {
    const s = JSON.stringify(data);
    return s.length > 200 ? s.slice(0, 200) + "…" : s;
  } catch {
    return String(data);
  }
}
