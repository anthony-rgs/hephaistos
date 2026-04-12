import { useState } from "react";
import axios from "axios";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const INVIDIOUS_INSTANCES = [
  "https://yt.chocolatemoo53.com",
  "https://inv.thepixora.com",
];

interface VideoResult {
  type: string;
  videoId: string;
  title: string;
  author: string;
  authorVerified: boolean;
  lengthSeconds: number;
  viewCountText: string;
  publishedText: string;
  videoThumbnails: {
    url: string;
    quality: string;
    width: number;
    height: number;
  }[];
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function thumbnail(video: VideoResult) {
  return (
    video.videoThumbnails.find((t) => t.quality === "maxresdefault")?.url ||
    video.videoThumbnails.find((t) => t.quality === "maxres")?.url ||
    video.videoThumbnails.find((t) => t.quality === "sddefault")?.url ||
    video.videoThumbnails.find((t) => t.quality === "high")?.url ||
    video.videoThumbnails[0]?.url ||
    ""
  );
}

export default function YoutubeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");

    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const { data } = await axios.get(`${instance}/api/v1/search`, {
          params: { q: query, type: "video" },
          timeout: 5000,
        });
        setResults((data as VideoResult[]).filter((r) => r.type === "video").slice(0, 5));
        setLoading(false);
        return;
      } catch {
        continue;
      }
    }

    setError("Toutes les instances sont indisponibles. Réessaie plus tard.");
    setResults([]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          placeholder="Rechercher une vidéo YouTube..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Recherche..." : "Rechercher"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {results.length > 0 && (
        <div className="flex flex-col gap-1">
          {results.map((video) => (
            <button
              key={video.videoId}
              onClick={() => setSelectedVideo(video)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left transition-colors group"
            >
              {/* Thumbnail */}
              <div className="relative shrink-0 w-32 h-18 rounded overflow-hidden bg-muted">
                <img
                  src={thumbnail(video)}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1 rounded">
                  {formatDuration(video.lengthSeconds)}
                </span>
              </div>

              {/* Infos */}
              <div className="flex flex-col gap-0.5 overflow-hidden flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {video.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {video.author}
                  {video.authorVerified && (
                    <span className="ml-1 text-[10px]">✓</span>
                  )}
                </p>
                <div className="flex gap-2 text-[11px] text-muted-foreground">
                  <span>{video.viewCountText}</span>
                  <span>·</span>
                  <span>{video.publishedText}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedVideo}
        onOpenChange={() => setSelectedVideo(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="line-clamp-2 leading-snug">
              {selectedVideo?.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedVideo?.author}
            </p>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full rounded"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
