import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { AppState, AppAction } from "@/lib/types";

const initialState: AppState = {
  fileName: null,
  lines: [],
  filteredIndices: [],
  searchQuery: "",
  joraQuery: "",
  joraResult: null,
  joraError: null,
  joraPerLineResults: [],
  expandedJoraCells: new Set(),
  isLoading: false,
  parseProgress: 0,
  expandedRows: new Set(),
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_FILE":
      return {
        ...initialState,
        fileName: action.fileName,
        isLoading: true,
      };
    case "ADD_LINES": {
      const lines = [...state.lines, ...action.lines];
      const filteredIndices =
        state.searchQuery === ""
          ? lines.map((_, i) => i)
          : state.filteredIndices;
      return { ...state, lines, filteredIndices };
    }
    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };
    case "SET_PROGRESS":
      return { ...state, parseProgress: action.value };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.query };
    case "SET_FILTERED_INDICES":
      return { ...state, filteredIndices: action.indices };
    case "SET_JORA_QUERY":
      return { ...state, joraQuery: action.query };
    case "SET_JORA_RESULT":
      return {
        ...state,
        joraResult: action.result,
        joraError: action.error ?? null,
      };
    case "SET_JORA_PER_LINE":
      return {
        ...state,
        joraPerLineResults: action.results,
        joraError: action.error ?? null,
      };
    case "TOGGLE_JORA_CELL": {
      const expandedJora = new Set(state.expandedJoraCells);
      if (expandedJora.has(action.index)) {
        expandedJora.delete(action.index);
      } else {
        expandedJora.add(action.index);
      }
      return { ...state, expandedJoraCells: expandedJora };
    }
    case "TOGGLE_ROW": {
      const expanded = new Set(state.expandedRows);
      if (expanded.has(action.index)) {
        expanded.delete(action.index);
      } else {
        expanded.add(action.index);
      }
      return { ...state, expandedRows: expanded };
    }
    case "FOLD_ALL":
      return { ...state, expandedRows: new Set(), expandedJoraCells: new Set() };
    case "UNFOLD_ALL":
      return {
        ...state,
        expandedRows: new Set(state.filteredIndices),
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const StateContext = createContext<AppState>(initialState);
const DispatchContext = createContext<Dispatch<AppAction>>(() => {});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext value={state}>
      <DispatchContext value={dispatch}>{children}</DispatchContext>
    </StateContext>
  );
}

export function useAppState() {
  return useContext(StateContext);
}

export function useAppDispatch() {
  return useContext(DispatchContext);
}
