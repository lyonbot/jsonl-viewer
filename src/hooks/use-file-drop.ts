import { useCallback } from "react";
import { useAppDispatch } from "./use-ndjson-store";
import { parseNdjsonStream } from "@/lib/ndjson-parser";
import type { NdjsonLine } from "@/lib/types";

const WORKER_THRESHOLD = 10 * 1024 * 1024; // 10MB

export function useFileDrop() {
  const dispatch = useAppDispatch();

  const handleFile = useCallback(
    (file: File) => {
      dispatch({ type: "SET_FILE", fileName: file.name });

      if (file.size > WORKER_THRESHOLD) {
        const worker = new Worker(
          new URL("@/lib/parse-worker.ts", import.meta.url),
          { type: "module" }
        );
        worker.onmessage = (e) => {
          const msg = e.data;
          if (msg.type === "batch") {
            dispatch({ type: "ADD_LINES", lines: msg.lines as NdjsonLine[] });
          } else if (msg.type === "progress") {
            dispatch({ type: "SET_PROGRESS", value: msg.value });
          } else if (msg.type === "done") {
            dispatch({ type: "SET_LOADING", isLoading: false });
            worker.terminate();
          }
        };
        worker.postMessage(file);
      } else {
        parseNdjsonStream(file, {
          onBatch: (lines) => dispatch({ type: "ADD_LINES", lines }),
          onProgress: (value) => dispatch({ type: "SET_PROGRESS", value }),
          onDone: () => dispatch({ type: "SET_LOADING", isLoading: false }),
        });
      }
    },
    [dispatch]
  );

  return handleFile;
}
