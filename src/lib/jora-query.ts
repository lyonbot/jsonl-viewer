import jora from "jora";

export interface JoraResult {
  result: unknown[] | null;
  error?: string;
}

export function executeJoraQuery(query: string, data: unknown[]): JoraResult {
  if (!query.trim()) return { result: null };
  try {
    const fn = jora(query);
    const result = fn(data);
    const arr = Array.isArray(result) ? result : [result];
    return { result: arr };
  } catch (e) {
    return { result: null, error: (e as Error).message };
  }
}

export interface JoraPerLineResult {
  results: (unknown | null)[];
  error?: string;
}

export function executeJoraQueryPerLine(
  query: string,
  data: (unknown | null)[]
): JoraPerLineResult {
  if (!query.trim()) return { results: [] };
  try {
    const fn = jora(query);
    const results = data.map((item) => {
      if (item == null) return null;
      try {
        return fn(item);
      } catch {
        return null;
      }
    });
    return { results };
  } catch (e) {
    return { results: [], error: (e as Error).message };
  }
}
