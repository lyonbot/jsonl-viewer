export interface NdjsonLine {
  index: number;
  raw: string;
  parsed: unknown;
  error?: string;
}

export interface AppState {
  fileName: string | null;
  lines: NdjsonLine[];
  filteredIndices: number[];
  searchQuery: string;
  joraQuery: string;
  joraResult: unknown[] | null;
  joraError: string | null;
  joraPerLineResults: (unknown | null)[];
  expandedJoraCells: Set<number>;
  isLoading: boolean;
  parseProgress: number;
  expandedRows: Set<number>;
}

export type AppAction =
  | { type: "SET_FILE"; fileName: string }
  | { type: "ADD_LINES"; lines: NdjsonLine[] }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_PROGRESS"; value: number }
  | { type: "SET_SEARCH_QUERY"; query: string }
  | { type: "SET_FILTERED_INDICES"; indices: number[] }
  | { type: "SET_JORA_QUERY"; query: string }
  | { type: "SET_JORA_RESULT"; result: unknown[] | null; error?: string | null }
  | { type: "SET_JORA_PER_LINE"; results: (unknown | null)[]; error?: string | null }
  | { type: "TOGGLE_JORA_CELL"; index: number }
  | { type: "TOGGLE_ROW"; index: number }
  | { type: "FOLD_ALL" }
  | { type: "UNFOLD_ALL" }
  | { type: "RESET" };
