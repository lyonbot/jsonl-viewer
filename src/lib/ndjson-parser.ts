import type { NdjsonLine } from "./types";

export interface ParseCallbacks {
  onBatch: (lines: NdjsonLine[]) => void;
  onProgress: (value: number) => void;
  onDone: () => void;
}

export async function parseNdjsonStream(
  file: File,
  callbacks: ParseCallbacks
) {
  const { onBatch, onProgress, onDone } = callbacks;
  const stream = file.stream().pipeThrough(new TextDecoderStream());
  const reader = stream.getReader();

  let buffer = "";
  let lineIndex = 0;
  let bytesRead = 0;
  let batch: NdjsonLine[] = [];
  const BATCH_SIZE = 1000;

  function flushBatch() {
    if (batch.length > 0) {
      onBatch(batch);
      batch = [];
    }
  }

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    bytesRead += new TextEncoder().encode(value).length;
    buffer += value;

    const parts = buffer.split("\n");
    buffer = parts.pop()!;

    for (const rawLine of parts) {
      const trimmed = rawLine.trim();
      if (trimmed === "") continue;

      let parsed: unknown = null;
      let error: string | undefined;
      try {
        parsed = JSON.parse(trimmed);
      } catch (e) {
        error = (e as Error).message;
      }

      batch.push({ index: lineIndex, raw: trimmed, parsed, error });
      lineIndex++;

      if (batch.length >= BATCH_SIZE) {
        flushBatch();
        onProgress(bytesRead / file.size);
        await yieldToMain();
      }
    }
  }

  if (buffer.trim()) {
    let parsed: unknown = null;
    let error: string | undefined;
    try {
      parsed = JSON.parse(buffer.trim());
    } catch (e) {
      error = (e as Error).message;
    }
    batch.push({ index: lineIndex, raw: buffer.trim(), parsed, error });
  }

  flushBatch();
  onProgress(1);
  onDone();
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export function parseNdjsonString(text: string): NdjsonLine[] {
  const lines: NdjsonLine[] = [];
  let index = 0;
  for (const rawLine of text.split("\n")) {
    const trimmed = rawLine.trim();
    if (trimmed === "") continue;
    let parsed: unknown = null;
    let error: string | undefined;
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      error = (e as Error).message;
    }
    lines.push({ index, raw: trimmed, parsed, error });
    index++;
  }
  return lines;
}
