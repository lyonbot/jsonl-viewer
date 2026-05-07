import { useRef, useCallback, useEffect } from "react";
import { useDebounceFn, useKeyPress } from "ahooks";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppState, useAppDispatch } from "@/hooks/use-ndjson-store";
import { filterLines } from "@/lib/search";

export function SearchBar() {
  const { lines, searchQuery, filteredIndices } = useAppState();
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  const { run: debouncedFilter } = useDebounceFn(
    (query: string) => {
      const indices = filterLines(lines, query);
      dispatch({ type: "SET_FILTERED_INDICES", indices });
    },
    { wait: 100 }
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      dispatch({ type: "SET_SEARCH_QUERY", query });
      debouncedFilter(query);
    },
    [dispatch, debouncedFilter]
  );

  // Re-filter when lines change (e.g., during parsing)
  useEffect(() => {
    if (searchQuery) {
      debouncedFilter(searchQuery);
    }
  }, [lines.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useKeyPress(["ctrl.f", "meta.f"], (e) => {
    e.preventDefault();
    inputRef.current?.focus();
  });

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b">
      <Search className="w-4 h-4 text-muted-foreground shrink-0" />
      <Input
        ref={inputRef}
        placeholder="Search lines... (Ctrl+F)"
        className="h-8 text-sm"
        value={searchQuery}
        onChange={handleChange}
      />
      {searchQuery && (
        <Badge variant="secondary" className="shrink-0 tabular-nums">
          {filteredIndices.length.toLocaleString()} match
          {filteredIndices.length !== 1 ? "es" : ""}
        </Badge>
      )}
    </div>
  );
}
