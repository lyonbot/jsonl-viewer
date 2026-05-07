import { StoreProvider, useAppState } from "@/hooks/use-ndjson-store";
import { Header } from "@/components/Header";
import { FileDropZone } from "@/components/FileDropZone";
import { ParseProgress } from "@/components/ParseProgress";
import { SearchBar } from "@/components/SearchBar";
import { Toolbar } from "@/components/Toolbar";
import { JoraPanel } from "@/components/JoraPanel";
import { LineList } from "@/components/LineList";

function AppContent() {
  const { fileName } = useAppState();

  return (
    <div className="flex flex-col h-screen">
      <Header />
      {!fileName ? (
        <FileDropZone />
      ) : (
        <main className="flex flex-col flex-1 overflow-hidden">
          <ParseProgress />
          <SearchBar />
          <Toolbar />
          <JoraPanel />
          <LineList />
        </main>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
