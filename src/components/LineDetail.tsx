import { JsonTree } from "./JsonTree";
import type { NdjsonLine } from "@/lib/types";

interface LineDetailProps {
  line: NdjsonLine;
}

export function LineDetail({ line }: LineDetailProps) {
  return (
    <div className="px-4 py-2 bg-muted/50 border-t border-b border-muted font-mono text-xs overflow-x-auto">
      {line.error ? (
        <div>
          <span className="text-destructive font-semibold">Parse error: </span>
          <span className="text-destructive">{line.error}</span>
          <pre className="mt-1 text-muted-foreground whitespace-pre-wrap">{line.raw}</pre>
        </div>
      ) : (
        <JsonTree data={line.parsed} />
      )}
    </div>
  );
}
