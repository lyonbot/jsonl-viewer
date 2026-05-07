interface WorkerNdjsonLine {
  index: number;
  raw: string;
  parsed: unknown;
  error?: string;
}

const BATCH_SIZE = 1000;

self.onmessage = async (e: MessageEvent<File>) => {
  const file = e.data;
  const stream = file.stream().pipeThrough(new TextDecoderStream());
  const reader = stream.getReader();

  let buffer = "";
  let lineIndex = 0;
  let bytesRead = 0;
  let batch: WorkerNdjsonLine[] = [];

  function flushBatch() {
    if (batch.length > 0) {
      self.postMessage({ type: "batch", lines: batch });
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
        self.postMessage({ type: "progress", value: bytesRead / file.size });
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
  self.postMessage({ type: "progress", value: 1 });
  self.postMessage({ type: "done" });
};
