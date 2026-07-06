import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAppDispatch } from "@/store";
import { setAllDurations } from "@/store/createVideoSlice";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import SectionHeader from "./SectionHeader";
import VideoSearchPanel from "./VideoSearchPanel";
import VideoSelectionFields from "./VideoSelectionFields";
import { type VideoResult } from "./VideoResultItem";

// ─── YT IFrame API ────────────────────────────────────────────────────────────

interface YTPlayer {
  getCurrentTime(): number;
  destroy(): void;
  pauseVideo(): void;
}

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement | HTMLIFrameElement, opts: object) => YTPlayer };
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

export interface VideoSelection {
  url: string;
  start: string;
  duration: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function secondsToTimecode(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function stripStreams(title: string): string {
  return title.replace(/\s*\(\d+(?:[.,]\d+)?b\)\s*$/i, "").trim();
}

function extractVideoId(url: string): string | null {
  try { return new URL(url).searchParams.get("v"); } catch { return null; }
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

  const playerRef = useRef<YTPlayer | null>(null);
  const pausePollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelInitRef = useRef<(() => void) | null>(null);

  const activeVideoId = selected?.videoId ?? extractVideoId(initial.url);

  // ── YT Player ──────────────────────────────────────────────────────────────

  const handleContainer = useCallback((node: HTMLDivElement | null) => {
    cancelInitRef.current?.();
    cancelInitRef.current = null;
    if (pausePollRef.current) { clearInterval(pausePollRef.current); pausePollRef.current = null; }
    playerRef.current?.destroy();
    playerRef.current = null;

    if (!node || !activeVideoId) return;

    let cancelled = false;
    cancelInitRef.current = () => { cancelled = true; };

    const clearPausePoll = () => {
      if (pausePollRef.current) { clearInterval(pausePollRef.current); pausePollRef.current = null; }
    };

    const initPlayer = () => {
      if (cancelled || !window.YT?.Player) return;
      node.innerHTML = '';
      playerRef.current = new window.YT.Player(node, {
        videoId: activeVideoId,
        width: "100%",
        height: "100%",
        playerVars: { rel: 0, enablejsapi: 1 },
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === 3 && playerRef.current) {
              clearPausePoll();
              const t = secondsToTimecode(Math.floor(playerRef.current.getCurrentTime()));
              if (syncTimecodeRef.current) setStart(t);
            }
            if (e.data === 2) {
              clearPausePoll();
              let lastTime = playerRef.current?.getCurrentTime() ?? 0;
              pausePollRef.current = setInterval(() => {
                const current = playerRef.current?.getCurrentTime() ?? lastTime;
                if (Math.abs(current - lastTime) > 0.5) {
                  const t = secondsToTimecode(Math.floor(current));
                  if (syncTimecodeRef.current) setStart(t);
                }
                lastTime = current;
              }, 150);
            } else {
              clearPausePoll();
            }
          },
        },
      });
    };

    loadYTScript();
    if (window.YT?.Player) initPlayer();
    else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); initPlayer(); };
    }
  }, [activeVideoId]);

  useEffect(() => {
    if (!open) playerRef.current?.pauseVideo();
  }, [open]);

  // ── Search ─────────────────────────────────────────────────────────────────

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
        setResults((data as VideoResult[]).filter((r) => r.type === "video").slice(0, 10));
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[72dvw] p-0 gap-0 overflow-hidden">
        <div className="flex items-center px-6 py-4 border-b shrink-0">
          <SectionHeader eyebrow="Vidéo" title="Choisir une vidéo" />
        </div>

        <div className="grid grid-cols-[2fr_3fr] h-[80vh] min-h-0 overflow-hidden">
          <VideoSearchPanel
            query={query}
            setQuery={setQuery}
            results={results}
            loading={loading}
            error={error}
            selectedId={selected?.videoId ?? null}
            onSearch={handleSearch}
            onSelect={handleSelect}
          />

          <div className="flex flex-col min-h-0 p-4 gap-3">
            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
              {activeVideoId ? (
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shrink-0">
                  <div ref={handleContainer} className="w-full h-full" />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-lg border border-dashed border-border flex items-center justify-center shrink-0">
                  <p className="text-xs text-muted-foreground">
                    Sélectionne une vidéo ou colle une URL
                  </p>
                </div>
              )}

              <VideoSelectionFields
                url={url}
                onUrlChange={setUrl}
                start={start}
                onStartChange={setStart}
                duration={duration}
                onDurationChange={setDuration}
                syncTimecode={syncTimecode}
                onToggleSync={() => {
                  const next = !syncTimecode;
                  setSyncTimecode(next);
                  syncTimecodeRef.current = next;
                }}
                onApplyAllDurations={() => {
                  dispatch(setAllDurations(duration));
                  toast.success(`Durée de ${duration}s appliquée à tous les extraits`);
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button size="sm" variant="outline" tabIndex={-1} onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button size="sm" onClick={handleConfirm} disabled={!url}>
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
