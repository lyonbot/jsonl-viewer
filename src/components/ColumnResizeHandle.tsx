import { useCallback } from "react";

interface ColumnResizeHandleProps {
  colIndex: number;
  containerRef: React.RefObject<HTMLElement | null>;
  onResizeStart: (colIndex: number, containerEl: HTMLElement) => void;
}

export function ColumnResizeHandle({
  colIndex,
  containerRef,
  onResizeStart,
}: ColumnResizeHandleProps) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (containerRef.current) {
        onResizeStart(colIndex, containerRef.current);
      }
    },
    [colIndex, containerRef, onResizeStart]
  );

  return (
    <div
      className="absolute top-0 bottom-0 w-[5px] -right-[2px] cursor-col-resize z-10 group"
      onMouseDown={handleMouseDown}
    >
      <div className="absolute top-0 bottom-0 left-[2px] w-[1px] bg-border group-hover:bg-primary group-hover:w-[2px] group-hover:left-[1.5px] transition-all" />
    </div>
  );
}
