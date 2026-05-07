import { useCallback, useRef, type CSSProperties } from "react";
import { useLocalStorageState } from "ahooks";

const STORAGE_KEY = "ndjson-viewer-col-widths";
const SEQ_WIDTH = 60;

interface ColumnResizeResult {
  columnStyles: CSSProperties;
  onResizeStart: (colIndex: number, containerEl: HTMLElement) => void;
}

export function useColumnResize(hasJora: boolean): ColumnResizeResult {
  const [storedWidths, setStoredWidths] = useLocalStorageState<{
    two: [number];
    three: [number, number];
  }>(STORAGE_KEY, {
    defaultValue: { two: [100], three: [50, 50] },
  });

  const widths = storedWidths!;
  const dragging = useRef(false);

  const columnStyles: CSSProperties = hasJora
    ? {
        ["--col-seq" as string]: `${SEQ_WIDTH}px`,
        ["--col-raw" as string]: `minmax(0, ${widths.three[0]}fr)`,
        ["--col-jora" as string]: `minmax(0, ${widths.three[1]}fr)`,
      }
    : {
        ["--col-seq" as string]: `${SEQ_WIDTH}px`,
        ["--col-raw" as string]: `minmax(0, 1fr)`,
      };

  const onResizeStart = useCallback(
    (colIndex: number, containerEl: HTMLElement) => {
      if (dragging.current) return;
      dragging.current = true;

      const rect = containerEl.getBoundingClientRect();
      const availableWidth = rect.width - SEQ_WIDTH;

      const onMouseMove = (e: MouseEvent) => {
        const relX = e.clientX - rect.left - SEQ_WIDTH;
        const pct = Math.max(10, Math.min(90, (relX / availableWidth) * 100));

        setStoredWidths((prev) => {
          const p = prev!;
          if (hasJora) {
            if (colIndex === 0) {
              return { ...p, three: [pct, 100 - pct] };
            }
          }
          return p;
        });
      };

      const onMouseUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [hasJora, setStoredWidths]
  );

  return { columnStyles, onResizeStart };
}
