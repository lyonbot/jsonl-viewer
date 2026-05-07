import { useCallback } from "react";
import { useLocalStorageState } from "ahooks";
import { Moon, Sun, FileJson, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState, useAppDispatch } from "@/hooks/use-ndjson-store";

export function Header() {
  const { fileName, lines } = useAppState();
  const dispatch = useAppDispatch();
  const [theme, setTheme] = useLocalStorageState<"light" | "dark">(
    "ndjson-viewer-theme",
    { defaultValue: "light" }
  );

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, [theme, setTheme]);

  // Apply theme on mount
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, [dispatch]);

  return (
    <header className="flex items-center gap-3 px-4 py-2.5 border-b bg-card">
      <FileJson className="w-5 h-5 text-primary" />
      <h1 className="text-sm font-semibold">NDJSON Viewer</h1>

      {fileName && (
        <>
          <span className="text-xs text-muted-foreground truncate max-w-64">
            {fileName}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            ({lines.length.toLocaleString()} lines)
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs ml-auto"
            onClick={handleReset}
          >
            <FolderOpen className="w-3.5 h-3.5 mr-1" />
            New File
          </Button>
        </>
      )}

      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${fileName ? "" : "ml-auto"}`}
        onClick={toggleTheme}
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </Button>
    </header>
  );
}
