import { SearchIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import VideoResultItem, { type VideoResult } from "./VideoResultItem";

export default function VideoSearchPanel({
  query,
  setQuery,
  results,
  loading,
  error,
  selectedId,
  onSearch,
  onSelect,
}: {
  query: string;
  setQuery: (q: string) => void;
  results: VideoResult[];
  loading: boolean;
  error: string;
  selectedId: string | null;
  onSearch: () => void;
  onSelect: (video: VideoResult) => void;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-3 border-r p-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="pr-7"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
        <Button
          size="icon"
          variant="outline"
          onClick={onSearch}
          disabled={loading}
          tabIndex={-1}
        >
          <SearchIcon className="size-4" />
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto" tabIndex={-1}>
        {results.map((video) => (
          <VideoResultItem
            key={video.videoId}
            video={video}
            selected={selectedId === video.videoId}
            onSelect={() => onSelect(video)}
          />
        ))}
        {results.length === 0 && !loading && (
          <p className="text-xs text-muted-foreground text-center py-8">Aucun résultat</p>
        )}
      </div>
    </div>
  );
}
