import { useRef, useState, useCallback } from "react";
import { Upload, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileDrop } from "@/hooks/use-file-drop";
import { useAppDispatch } from "@/hooks/use-ndjson-store";
import { parseNdjsonString } from "@/lib/ndjson-parser";

export function FileDropZone() {
  const handleFile = useFileDrop();
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    if (!text.trim()) return;
    const lines = parseNdjsonString(text);
    if (lines.length === 0) return;
    dispatch({ type: "SET_FILE", fileName: "(clipboard)" });
    dispatch({ type: "ADD_LINES", lines });
    dispatch({ type: "SET_LOADING", isLoading: false });
  }, [dispatch]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg m-4 transition-colors ${
        dragOver
          ? "border-primary bg-accent"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <Upload className="w-12 h-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium mb-2">Drop an NDJSON file here</p>
      <p className="text-sm text-muted-foreground mb-4">
        or click to browse (supports .ndjson, .jsonl, .json)
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          Choose File
        </Button>
        <Button variant="outline" onClick={handlePaste}>
          <ClipboardPaste className="w-4 h-4 mr-1" />
          Paste from Clipboard
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".ndjson,.jsonl,.json"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
