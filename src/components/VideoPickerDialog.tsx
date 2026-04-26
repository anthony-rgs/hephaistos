import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { SearchIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store";
import { setAllDurations } from "@/store/createVideoSlice";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent } from "./ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

// ─── YT IFrame API ────────────────────────────────────────────────────────────

interface YTPlayer {
  getCurrentTime(): number;
  destroy(): void;
}

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: object) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYTScript() {
  if (document.getElementById("yt-iframe-api")) return;
  const s = document.createElement("script");
  s.id = "yt-iframe-api";
  s.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(s);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INVIDIOUS_INSTANCES = [
  "https://yt.chocolatemoo53.com",
  "https://inv.thepixora.com",
];

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function secondsToTimecode(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Utilise directement le CDN YouTube — fiable à 100%
function thumbnail(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

function stripStreams(title: string): string {
  return title.replace(/\s*\(\d+(?:[.,]\d+)?b\)\s*$/i, "").trim();
}

// ─── Component ────────────────────────────────────────────────────────────────

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
  const dispatch = useAppDispatch();

  const [query, setQuery] = useState(() => {
    const base = stripStreams(initialTitle);
    return base ? `${base} official clip` : "";
  });

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

  const [syncTimecode, setSyncTimecode] = useState(true);
  const syncTimecodeRef = useRef(true);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const hasBeenReadyRef = useRef(false);

  // ── Charger + initialiser le player YT ──────────────────────────────────────

  useEffect(() => {
    if (!selected || !open) return;

    hasBeenReadyRef.current = false;
    playerRef.current?.destroy();
    playerRef.current = null;

    const initPlayer = () => {
      if (!playerContainerRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: selected.videoId,
        playerVars: { origin: window.location.origin, rel: 0 },
        events: {
          onReady: () => {
            hasBeenReadyRef.current = true;
          },
          // State 3 = BUFFERING — déclenché quand l'utilisateur clique sur la barre de progression
          onStateChange: (e: { data: number }) => {
            if (
              e.data === 3 &&
              hasBeenReadyRef.current &&
              syncTimecodeRef.current &&
              playerRef.current
            )
              setStart(secondsToTimecode(playerRef.current.getCurrentTime()));
          },
        },
      });
    };

    loadYTScript();

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        initPlayer();
      };
    }

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
      hasBeenReadyRef.current = false;
    };
  }, [selected?.videoId, open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Recherche ───────────────────────────────────────────────────────────────

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
      <DialogContent className="min-w-[60vw] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b shrink-0">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="w-4 h-px bg-violet-400" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                Vidéo
              </span>
            </div>
            <h2 className="text-base font-semibold tracking-tight leading-none">
              Choisir une vidéo
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-[2fr_3fr] h-120 min-h-0 overflow-hidden">
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
                      ? "bg-violet-400/10 ring-1 ring-violet-400/30"
                      : "hover:bg-violet-400/5"
                  }`}
                >
                  <div className="relative shrink-0 w-20 aspect-video rounded overflow-hidden bg-muted">
                    <img
                      src={thumbnail(video.videoId)}
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
          <div className="flex flex-col gap-4 p-4 overflow-y-auto">
            {selected ? (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shrink-0">
                <div
                  ref={playerContainerRef}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-lg border border-dashed border-border flex items-center justify-center shrink-0">
                <p className="text-xs text-muted-foreground">
                  Sélectionne une vidéo ou colle une URL
                </p>
              </div>
            )}

            <div className="grid grid-cols-[7rem_2fr_0.5fr] items-center gap-x-3 gap-y-3">
              <Label className="justify-end text-muted-foreground">
                URL vidéo
              </Label>
              <Input
                tabIndex={-1}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
              <div />

              <Label className="justify-end text-muted-foreground">
                Début extrait
              </Label>
              <Input
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="00:00:00"
              />
              <div className="flex items-center justify-end gap-1.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        tabIndex={-1}
                        onClick={() => {
                          const next = !syncTimecode;
                          setSyncTimecode(next);
                          syncTimecodeRef.current = next;
                        }}
                        className={`shrink-0 flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide transition-colors border ${
                          syncTimecode
                            ? "border-violet-400/40 bg-violet-400/10 text-violet-400"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        AUTO
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {syncTimecode
                        ? "Timecode synchronisé — cliquer pour désactiver"
                        : "Timecode manuel — cliquer pour activer la sync"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        tabIndex={-1}
                        className="shrink-0 text-muted-foreground"
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      tabIndex={-1}
                      onClick={() => {
                        dispatch(setAllDurations(duration));
                        toast.success(
                          `Durée de ${duration}s appliquée à tous les extraits`,
                        );
                      }}
                      className="w-full flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide transition-colors border border-border text-muted-foreground hover:border-violet-400/40 hover:text-violet-400 hover:bg-violet-400/5"
                    >
                      TOUS
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Appliquer cette durée à tous les extraits (y compris les
                    futurs)
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t bg-muted/30 shrink-0">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
