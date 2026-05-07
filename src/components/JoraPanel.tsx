import { useCallback } from "react";
import { useDebounceFn } from "ahooks";
import { Code } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAppState, useAppDispatch } from "@/hooks/use-ndjson-store";
import { executeJoraQueryPerLine } from "@/lib/jora-query";

export function JoraPanel() {
  const { lines, joraQuery, joraPerLineResults, joraError } = useAppState();
  const dispatch = useAppDispatch();

  const { run: debouncedExecute } = useDebounceFn(
    (query: string) => {
      const data = lines.map((l) => l.parsed);
      const { results, error } = executeJoraQueryPerLine(query, data);
      dispatch({
        type: "SET_JORA_PER_LINE",
        results,
        error: error ?? null,
      });
    },
    { wait: 200 }
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const query = e.target.value;
      dispatch({ type: "SET_JORA_QUERY", query });
      debouncedExecute(query);
    },
    [dispatch, debouncedExecute]
  );

  const activeCount = joraPerLineResults.filter((r) => r != null).length;

  return (
    <Collapsible className="border-b">
      <CollapsibleTrigger className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm hover:bg-accent/50 transition-colors">
        <Code className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">Jora Transform</span>
        {joraQuery && (
          <span className="text-xs text-muted-foreground ml-auto">
            {activeCount > 0 ? `${activeCount} results` : ""}
          </span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-3 space-y-2">
          <textarea
            className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            placeholder='Try: .name or .filter(=> .status = "error")'
            value={joraQuery}
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground">
            <a
              href="https://discoveryjs.github.io/jora/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Jora syntax docs
            </a>
          </p>
          {joraError && (
            <p className="text-xs text-destructive">{joraError}</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
