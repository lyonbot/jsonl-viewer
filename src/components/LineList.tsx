import { useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAppState, useAppDispatch } from "@/hooks/use-ndjson-store";
import { useColumnResize } from "@/hooks/use-column-resize";
import { ColumnResizeHandle } from "./ColumnResizeHandle";
import { LineRow } from "./LineRow";

export function LineList() {
  const {
    lines,
    filteredIndices,
    expandedRows,
    expandedJoraCells,
    searchQuery,
    joraPerLineResults,
    joraQuery,
  } = useAppState();
  const dispatch = useAppDispatch();
  const parentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const hasJora = joraQuery.trim().length > 0 && joraPerLineResults.length > 0;
  const { columnStyles, onResizeStart } = useColumnResize(hasJora);

  const headerHeight = headerRef.current?.offsetHeight ?? 28;

  const virtualizer = useVirtualizer({
    count: filteredIndices.length,
    getScrollElement: () => parentRef.current,
    scrollMargin: headerHeight,
    estimateSize: useCallback(
      (index: number) => {
        const lineIdx = filteredIndices[index];
        const rawExpanded = expandedRows.has(lineIdx);
        const joraExpanded = expandedJoraCells.has(lineIdx);
        if (rawExpanded || joraExpanded) return 200;
        return 36;
      },
      [filteredIndices, expandedRows, expandedJoraCells]
    ),
    overscan: 20,
  });

  const handleToggleRaw = useCallback(
    (lineIndex: number) => {
      dispatch({ type: "TOGGLE_ROW", index: lineIndex });
    },
    [dispatch]
  );

  const handleToggleJora = useCallback(
    (lineIndex: number) => {
      dispatch({ type: "TOGGLE_JORA_CELL", index: lineIndex });
    },
    [dispatch]
  );

  return (
    <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden" style={columnStyles}>
      {/* Virtual list — header is inside the scroll container to stay aligned */}
      <div ref={parentRef} className="flex-1 min-h-0 overflow-auto" style={{ scrollbarGutter: "stable" }} id="line-list">
        {/* Table header */}
        <div
          ref={headerRef}
          className="grid font-mono text-xs font-semibold border-b bg-muted/50 sticky top-0 z-10"
          style={{
            gridTemplateColumns: hasJora
              ? "var(--col-seq) var(--col-raw) var(--col-jora)"
              : "var(--col-seq) var(--col-raw)",
          }}
        >
          <div className="px-2 py-1.5 text-right text-muted-foreground border-r border-border/30">
            #
          </div>
          <div className="px-3 py-1.5 text-muted-foreground border-r border-border/30 relative">
            Data
            {hasJora && (
              <ColumnResizeHandle
                colIndex={0}
                containerRef={containerRef}
                onResizeStart={onResizeStart}
              />
            )}
          </div>
          {hasJora && (
            <div className="px-3 py-1.5 text-muted-foreground">Jora Result</div>
          )}
        </div>
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const lineIndex = filteredIndices[virtualRow.index];
            const line = lines[lineIndex];
            const isExpanded = expandedRows.has(lineIndex);
            const isJoraExpanded = expandedJoraCells.has(lineIndex);

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                }}
              >
                <LineRow
                  line={line}
                  lineIndex={lineIndex}
                  isExpanded={isExpanded}
                  isJoraExpanded={isJoraExpanded}
                  searchQuery={searchQuery}
                  hasJora={hasJora}
                  joraResult={hasJora ? joraPerLineResults[lineIndex] : undefined}
                  onToggleRaw={handleToggleRaw}
                  onToggleJora={handleToggleJora}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { useVirtualizer } from "@tanstack/react-virtual";
