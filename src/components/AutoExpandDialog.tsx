import { Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAutoExpand } from "@/contexts/auto-expand-context";

interface AutoExpandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AutoExpandDialog({ open, onOpenChange }: AutoExpandDialogProps) {
  const { paths, remove, removeAll } = useAutoExpand();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Auto Expand Paths</DialogTitle>
          <DialogDescription>
            Paths configured here will always be expanded when viewing a JSON tree.
            Right-click a key in the JSON tree to add a path.
          </DialogDescription>
        </DialogHeader>

        {paths.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            No paths configured yet.
          </div>
        ) : (
          <div className="space-y-0.5 max-h-80 overflow-y-auto">
            {paths.map((path) => (
              <div
                key={path}
                className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-muted/60 group"
              >
                <code className="text-xs flex-1 font-mono truncate text-foreground">
                  {path || "<root>"}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(path)}
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {paths.length > 0 && (
          <div className="border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={removeAll}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
