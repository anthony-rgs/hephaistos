import { useState, useEffect } from "react";
import axios from "axios";
import { SearchIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Separator } from "./ui/separator";

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
  videoThumbnails: { url: string; quality: string }[];
}

export interface VideoSelection {
  url: string;
  start: string;
  duration: number;
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
    video.videoThumbnails.find((t) => t.quality === "sddefault")?.url ||
    video.videoThumbnails.find((t) => t.quality === "high")?.url ||
    video.videoThumbnails[0]?.url ||
    ""
  );
}

function stripStreams(title: string): string {
  return title.replace(/\s*\(\d+(?:[.,]\d+)?b\)\s*$/i, "").trim();
}

export default function VideoPickerDialog({
  open,
  onOpenChange,
  initial,
  initialTitle = "",
  autoSearch = false,
  onAutoSearchDone,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: VideoSelection;
  initialTitle?: string;
  autoSearch?: boolean;
  onAutoSearchDone?: () => void;
  onConfirm: (selection: VideoSelection) => void;
}) {
  const [query, setQuery] = useState(() => {
    const base = stripStreams(initialTitle);
    return base ? `${base} official clip` : "";
  });

  // Met à jour le query si le titre change (pattern derived state during render)
  const [syncedTitle, setSyncedTitle] = useState(initialTitle);
  if (initialTitle !== syncedTitle) {
    setSyncedTitle(initialTitle);
    const base = stripStreams(initialTitle);
    setQuery(base ? `${base} official clip` : "");
  }
  const [results, setResults] = useState<VideoResult[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<VideoResult | null>(null);

  const [url, setUrl] = useState(initial.url);
  const [start, setStart] = useState(initial.start);
  const [duration, setDuration] = useState(initial.duration);

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
        setResults(
          (data as VideoResult[])
            .filter((r) => r.type === "video")
            .slice(0, 10),
        );
        setLoading(false);
        return;
      } catch {
        continue;
      }
    }

    setError("Instances indisponibles. Réessaie plus tard.");
    setResults([]);
    setLoading(false);
  };

  useEffect(() => {
    if (open && autoSearch && query.trim()) {
      onAutoSearchDone?.();
      setTimeout(handleSearch, 0);
    }
  }, [open, autoSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (video: VideoResult) => {
    setSelected(video);
    setUrl(`https://www.youtube.com/watch?v=${video.videoId}`);
  };

  const handleConfirm = () => {
    onConfirm({ url, start, duration });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="min-w-[60vw] ">
        <div className="-mx-4">
          <DialogHeader className="px-5 pt-1 pb-4">
            <DialogTitle>Choisir une vidéo</DialogTitle>
          </DialogHeader>

          <Separator />
        </div>

        <div className="grid grid-cols-[2fr_3fr] h-120 overflow-hidden">
          {/* Colonne gauche — recherche */}
          <div className="flex min-h-0 flex-col gap-3 border-r p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Rechercher..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
                onClick={handleSearch}
                disabled={loading}
                tabIndex={-1}
              >
                <SearchIcon className="size-4" />
              </Button>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div
              className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto"
              tabIndex={-1}
            >
              {results.map((video) => (
                <button
                  tabIndex={-1}
                  key={video.videoId}
                  onClick={() => handleSelect(video)}
                  className={`flex items-center gap-2.5 rounded-lg p-2 text-left transition-colors ${
                    selected?.videoId === video.videoId
                      ? "bg-muted ring-1 ring-ring/30"
                      : "hover:bg-muted/60"
                  }`}
                >
                  <div className="relative shrink-0 w-20 aspect-video rounded overflow-hidden bg-muted">
                    <img
                      src={thumbnail(video)}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[9px] font-mono px-0.5 rounded">
                      {formatDuration(video.lengthSeconds)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-xs font-medium leading-snug line-clamp-2">
                      {video.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {video.author}
                      {video.authorVerified && <span className="ml-1">✓</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {video.viewCountText}
                    </p>
                  </div>
                </button>
              ))}

              {results.length === 0 && !loading && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Aucun résultat
                </p>
              )}
            </div>
          </div>

          {/* Colonne droite — preview + champs */}
          <div className="flex flex-col gap-4 p-4 overflow-scroll">
            {selected ? (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${selected.videoId}`}
                  allow="encrypted-media"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Sélectionne une vidéo ou colle une URL
                </p>
              </div>
            )}

            <div className="grid grid-cols-[7rem_1fr] items-center gap-x-3 gap-y-3">
              <Label className="justify-end text-muted-foreground">
                URL vidéo
              </Label>
              <Input
                tabIndex={-1}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />

              <Label className="justify-end text-muted-foreground">
                Début extrait
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  placeholder="00:00:00"
                  className="flex-1"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        tabIndex={-1}
                        className="shrink-0 text-muted-foreground "
                      >
                        <span className="text-xs font-medium">i</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      heures:minutes:secondes
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <Label className="justify-end text-muted-foreground">
                Durée (s)
              </Label>
              <Input
                type="number"
                min={0}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                placeholder="30"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-5 py-3">
          <Button
            variant="outline"
            tabIndex={-1}
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!url}
          >
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
