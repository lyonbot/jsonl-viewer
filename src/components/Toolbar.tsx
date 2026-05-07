import { useState, useCallback } from "react";
import { useKeyPress } from "ahooks";
import { FoldVertical, UnfoldVertical, ArrowDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState, useAppDispatch } from "@/hooks/use-ndjson-store";
import { ExportDialog } from "@/components/ExportDialog";

export function Toolbar() {
  const { lines, filteredIndices } = useAppState();
  const dispatch = useAppDispatch();
  const [goToValue, setGoToValue] = useState("");
  const [showGoTo, setShowGoTo] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const handleFoldAll = useCallback(
    () => dispatch({ type: "FOLD_ALL" }),
    [dispatch]
  );

  const handleUnfoldAll = useCallback(
    () => dispatch({ type: "UNFOLD_ALL" }),
    [dispatch]
  );

  const handleGoTo = useCallback(() => {
    const num = parseInt(goToValue, 10);
    if (isNaN(num) || num < 1) return;
    const targetIndex = num - 1;
    const virtualIndex = filteredIndices.indexOf(targetIndex);
    if (virtualIndex === -1) return;

    const el = document.getElementById("line-list");
    if (!el) return;
    // Approximate scroll to position
    el.scrollTop = virtualIndex * 36;
    setGoToValue("");
    setShowGoTo(false);
  }, [goToValue, filteredIndices]);

  useKeyPress(["ctrl.g", "meta.g"], (e) => {
    e.preventDefault();
    setShowGoTo((v) => !v);
  });

  useKeyPress(["ctrl.e", "meta.e"], (e) => {
    e.preventDefault();
    dispatch({ type: "FOLD_ALL" });
  });

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 border-b text-sm">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={handleFoldAll}
      >
        <FoldVertical className="w-3.5 h-3.5 mr-1" />
        Fold All
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={handleUnfoldAll}
      >
        <UnfoldVertical className="w-3.5 h-3.5 mr-1" />
        Unfold All
      </Button>

      {showGoTo && (
        <form
          className="flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            handleGoTo();
          }}
        >
          <Input
            type="number"
            min={1}
            max={lines.length}
            placeholder="Line #"
            className="h-7 w-24 text-xs"
            value={goToValue}
            onChange={(e) => setGoToValue(e.target.value)}
            autoFocus
          />
          <Button type="submit" variant="ghost" size="sm" className="h-7 px-2">
            <ArrowDown className="w-3.5 h-3.5" />
          </Button>
        </form>
      )}

      {!showGoTo && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => setShowGoTo(true)}
        >
          <ArrowDown className="w-3.5 h-3.5 mr-1" />
          Go to Line
          <kbd className="ml-1 text-[10px] text-muted-foreground">Ctrl+G</kbd>
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => setShowExport(true)}
      >
        <Download className="w-3.5 h-3.5 mr-1" />
        Export
      </Button>

      <div className="ml-auto text-xs text-muted-foreground tabular-nums">
        {filteredIndices.length === lines.length
          ? `${lines.length.toLocaleString()} lines`
          : `${filteredIndices.length.toLocaleString()} / ${lines.length.toLocaleString()} lines`}
      </div>

      <ExportDialog open={showExport} onOpenChange={setShowExport} />
    </div>
  );
}
