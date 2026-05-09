import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useLocalStorageState } from "ahooks";

const STORAGE_KEY = "ndjson-viewer-auto-expand-paths";

function isSubPath(child: string, parent: string): boolean {
  return (
    child === parent ||
    child.startsWith(parent + ".") ||
    child.startsWith(parent + "[")
  );
}

interface AutoExpandContextValue {
  paths: string[];
  isAutoExpand: (path: string) => boolean;
  toggle: (path: string) => void;
  remove: (path: string) => void;
  removeAll: () => void;
}

const AutoExpandContext = createContext<AutoExpandContextValue>({
  paths: [],
  isAutoExpand: () => false,
  toggle: () => {},
  remove: () => {},
  removeAll: () => {},
});

export function AutoExpandProvider({ children }: { children: ReactNode }) {
  const [paths, setPaths] = useLocalStorageState<string[]>(STORAGE_KEY, {
    defaultValue: [],
  });
  const safePaths = paths ?? [];

  const isAutoExpand = useCallback(
    (path: string) => safePaths.includes(path),
    [safePaths]
  );

  const toggle = useCallback(
    (path: string) => {
      if (safePaths.includes(path)) {
        setPaths(safePaths.filter((p) => !isSubPath(p, path)));
      } else {
        setPaths([...safePaths, path]);
      }
    },
    [safePaths, setPaths]
  );

  const remove = useCallback(
    (path: string) => {
      setPaths(safePaths.filter((p) => !isSubPath(p, path)));
    },
    [safePaths, setPaths]
  );

  const removeAll = useCallback(() => {
    setPaths([]);
  }, [setPaths]);

  return (
    <AutoExpandContext
      value={{ paths: safePaths, isAutoExpand, toggle, remove, removeAll }}
    >
      {children}
    </AutoExpandContext>
  );
}

export function useAutoExpand() {
  return useContext(AutoExpandContext);
}
