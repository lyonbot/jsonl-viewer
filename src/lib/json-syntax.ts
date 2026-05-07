import type { ReactNode } from "react";
import { createElement } from "react";

type TokenType = "key" | "string" | "number" | "boolean" | "null" | "bracket" | "plain";

const classMap: Record<TokenType, string> = {
  key: "text-rose-500 dark:text-rose-400",
  string: "text-green-600 dark:text-green-400",
  number: "text-blue-600 dark:text-blue-400",
  boolean: "text-purple-600 dark:text-purple-400",
  null: "text-zinc-400 dark:text-zinc-500",
  bracket: "text-zinc-500 dark:text-zinc-400",
  plain: "",
};

interface Token {
  type: TokenType;
  value: string;
}

export function tokenizeJson(raw: string): Token[] {
  const tokens: Token[] = [];
  const regex =
    /("(?:[^"\\]|\\.)*")\s*:/g;
  let lastIndex = 0;

  // First pass: identify keys
  const keyPositions = new Map<number, number>();
  let match;
  while ((match = regex.exec(raw)) !== null) {
    keyPositions.set(match.index, match.index + match[1].length);
  }

  // Second pass: tokenize
  const tokenRegex =
    /("(?:[^"\\]|\\.)*")|(true|false)|(null)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\]:,])/g;

  let m;
  while ((m = tokenRegex.exec(raw)) !== null) {
    if (m.index > lastIndex) {
      const gap = raw.slice(lastIndex, m.index);
      if (gap.trim()) tokens.push({ type: "plain", value: gap });
    }

    if (m[1] !== undefined) {
      // String or key
      if (keyPositions.has(m.index)) {
        tokens.push({ type: "key", value: m[1] });
      } else {
        tokens.push({ type: "string", value: m[1] });
      }
    } else if (m[2] !== undefined) {
      tokens.push({ type: "boolean", value: m[2] });
    } else if (m[3] !== undefined) {
      tokens.push({ type: "null", value: m[3] });
    } else if (m[4] !== undefined) {
      tokens.push({ type: "number", value: m[4] });
    } else if (m[5] !== undefined) {
      tokens.push({ type: "bracket", value: m[5] });
    }

    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < raw.length) {
    const rest = raw.slice(lastIndex);
    if (rest.trim()) tokens.push({ type: "plain", value: rest });
  }

  return tokens;
}

export function renderTokens(tokens: Token[]): ReactNode[] {
  return tokens.map((t, i) =>
    createElement("span", { key: i, className: classMap[t.type] }, t.value)
  );
}

export function highlightJson(raw: string): ReactNode[] {
  return renderTokens(tokenizeJson(raw));
}

export function highlightWithSearch(
  raw: string,
  searchQuery: string
): ReactNode[] {
  if (!searchQuery) return highlightJson(raw);

  const tokens = tokenizeJson(raw);
  const nodes: ReactNode[] = [];
  let key = 0;

  for (const token of tokens) {
    const cls = classMap[token.type];
    const lower = token.value.toLowerCase();
    const queryLower = searchQuery.toLowerCase();
    const idx = lower.indexOf(queryLower);

    if (idx === -1) {
      nodes.push(createElement("span", { key: key++, className: cls }, token.value));
    } else {
      const before = token.value.slice(0, idx);
      const match = token.value.slice(idx, idx + searchQuery.length);
      const after = token.value.slice(idx + searchQuery.length);
      if (before) nodes.push(createElement("span", { key: key++, className: cls }, before));
      nodes.push(
        createElement(
          "mark",
          { key: key++, className: "bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5" },
          createElement("span", { className: cls }, match)
        )
      );
      if (after) nodes.push(createElement("span", { key: key++, className: cls }, after));
    }
  }

  return nodes;
}
