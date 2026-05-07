import type { NdjsonLine } from "./types";

export function filterLines(lines: NdjsonLine[], query: string): number[] {
  if (!query) return lines.map((_, i) => i);
  const lower = query.toLowerCase();
  const result: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].raw.toLowerCase().includes(lower)) {
      result.push(i);
    }
  }
  return result;
}
