import { useState, useCallback } from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppState } from "@/hooks/use-ndjson-store";

type Format = "jsonl" | "json-array";
type Scope = "all" | "filtered";
type DataSource = "raw" | "jora";
type NullHandling = "keep" | "filter";

export function ExportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    lines,
    filteredIndices,
    joraPerLineResults,
    joraQuery,
    searchQuery,
    fileName,
  } = useAppState();

  const [format, setFormat] = useState<Format>("jsonl");
  const [scope, setScope] = useState<Scope>("all");
  const [dataSource, setDataSource] = useState<DataSource>("raw");
  const [nullHandling, setNullHandling] = useState<NullHandling>("keep");

  const hasSearch = searchQuery !== "";
  const hasJora = joraQuery !== "" && joraPerLineResults.length > 0;

  const buildData = useCallback(() => {
    // Determine which line indices to use
    const indices = scope === "filtered" && hasSearch ? filteredIndices : lines.map((_, i) => i);

    // Collect items
    let items: unknown[];
    if (dataSource === "jora" && hasJora) {
      items = indices.map((i) => joraPerLineResults[i]);
      if (nullHandling === "filter") {
        items = items.filter((v) => v != null);
      }
    } else {
      items = indices.map((i) => lines[i].parsed);
    }

    return items;
  }, [scope, hasSearch, filteredIndices, lines, dataSource, hasJora, joraPerLineResults, nullHandling]);

  const serialize = useCallback(
    (items: unknown[]) => {
      if (format === "jsonl") {
        return items.map((item) => JSON.stringify(item)).join("\n");
      }
      return JSON.stringify(items, null, 2);
    },
    [format]
  );

  const handleCopy = useCallback(() => {
    const text = serialize(buildData());
    navigator.clipboard.writeText(text);
    onOpenChange(false);
  }, [serialize, buildData, onOpenChange]);

  const handleDownload = useCallback(() => {
    const text = serialize(buildData());
    const ext = format === "jsonl" ? ".jsonl" : ".json";
    const base = fileName ? fileName.replace(/\.[^.]+$/, "") : "export";
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = base + ext;
    a.click();
    URL.revokeObjectURL(url);
    onOpenChange(false);
  }, [serialize, buildData, format, fileName, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export</DialogTitle>
          <DialogDescription>Configure export options</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Format */}
          <fieldset className="space-y-1.5">
            <legend className="font-medium">Format</legend>
            <div className="flex gap-3">
              <RadioOption
                name="format"
                value="jsonl"
                label="JSONL"
                checked={format === "jsonl"}
                onChange={() => setFormat("jsonl")}
              />
              <RadioOption
                name="format"
                value="json-array"
                label="JSON Array"
                checked={format === "json-array"}
                onChange={() => setFormat("json-array")}
              />
            </div>
          </fieldset>

          {/* Scope — only when search is active */}
          {hasSearch && (
            <fieldset className="space-y-1.5">
              <legend className="font-medium">Scope</legend>
              <div className="flex gap-3">
                <RadioOption
                  name="scope"
                  value="all"
                  label="All lines"
                  checked={scope === "all"}
                  onChange={() => setScope("all")}
                />
                <RadioOption
                  name="scope"
                  value="filtered"
                  label="Search filtered only"
                  checked={scope === "filtered"}
                  onChange={() => setScope("filtered")}
                />
              </div>
            </fieldset>
          )}

          {/* Data source — only when jora is active */}
          {hasJora && (
            <fieldset className="space-y-1.5">
              <legend className="font-medium">Data source</legend>
              <div className="flex gap-3">
                <RadioOption
                  name="dataSource"
                  value="raw"
                  label="Raw"
                  checked={dataSource === "raw"}
                  onChange={() => setDataSource("raw")}
                />
                <RadioOption
                  name="dataSource"
                  value="jora"
                  label="Jora results"
                  checked={dataSource === "jora"}
                  onChange={() => setDataSource("jora")}
                />
              </div>
            </fieldset>
          )}

          {/* Null handling — only when jora results selected */}
          {hasJora && dataSource === "jora" && (
            <fieldset className="space-y-1.5">
              <legend className="font-medium">Null handling</legend>
              <div className="flex gap-3">
                <RadioOption
                  name="nullHandling"
                  value="keep"
                  label="Keep null"
                  checked={nullHandling === "keep"}
                  onChange={() => setNullHandling("keep")}
                />
                <RadioOption
                  name="nullHandling"
                  value="filter"
                  label="Filter out null"
                  checked={nullHandling === "filter"}
                  onChange={() => setNullHandling("filter")}
                />
              </div>
            </fieldset>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-3.5 h-3.5 mr-1" />
            Copy to clipboard
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5 mr-1" />
            Download file
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RadioOption({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="accent-primary"
      />
      {label}
    </label>
  );
}
