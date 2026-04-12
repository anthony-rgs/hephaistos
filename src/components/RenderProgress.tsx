import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/store";
import type { RenderStatus, ClipRenderData } from "@/store/renderSlice";
import { CheckIcon, LoaderIcon, ClockIcon, XIcon } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RUNNING: RenderStatus[] = ["pending", "downloading", "processing"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function RenderProgress() {
  const job = useAppSelector((s) => s.render.job);

  const startedAt      = useRef<number | null>(null);
  const downloadingAt  = useRef<number | null>(null);
  const processingAt   = useRef<number | null>(null);
  const doneAt         = useRef<number | null>(null);
  const cancelledAt    = useRef<number | null>(null);

  // Timers par clip : id → { start, end? }
  const clipTimers = useRef<Map<string, { start: number; end?: number }>>(new Map());
  const prevClips  = useRef<ClipRenderData[] | undefined>(undefined);

  const [, setTick] = useState(0);
  useEffect(() => {
    if (job?.status === "cancelled" || job?.status === "done" || job?.status === "failed") return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [job?.status]);

  // Timestamps phase
  const prevStatus = useRef<RenderStatus | null>(null);
  if (job && job.status !== prevStatus.current) {
    const now = Date.now();
    if (prevStatus.current === null) startedAt.current = now;
    if (job.status === "downloading" && !downloadingAt.current)  downloadingAt.current = now;
    if (job.status === "processing"  && !processingAt.current)   processingAt.current  = now;
    if (job.status === "done"        && !doneAt.current)          doneAt.current        = now;
    if (job.status === "cancelled"   && !cancelledAt.current)     cancelledAt.current   = now;
    prevStatus.current = job.status;
  }

  // Timestamps par clip
  if (job?.clips && job.clips !== prevClips.current) {
    const now = Date.now();
    for (const clip of job.clips) {
      const key = clip.id;
      const prev = prevClips.current?.find((c) => c.id === key);
      if (clip.status === "downloading" && prev?.status !== "downloading") {
        if (!clipTimers.current.has(key)) clipTimers.current.set(key, { start: now });
      }
      if (clip.status === "done" && prev?.status === "downloading") {
        const t = clipTimers.current.get(key);
        if (t && !t.end) clipTimers.current.set(key, { ...t, end: now });
      }
    }
    prevClips.current = job.clips;
  }

  if (!job) return null;

  const now           = Date.now();
  const isCancelled   = job.status === "cancelled";
  const isRunning     = RUNNING.includes(job.status);
  const isDone        = job.status === "done";
  const isFailed      = job.status === "failed";
  const isDownloading = job.status === "downloading";
  const isProcessing  = job.status === "processing";

  // Quand cancelled, on fige les timers à l'instant de l'annulation
  const frozenAt = cancelledAt.current ?? doneAt.current;
  const totalElapsed    = startedAt.current     ? (frozenAt ?? now) - startedAt.current     : null;
  const downloadElapsed = downloadingAt.current ? (processingAt.current ?? frozenAt ?? now) - downloadingAt.current : null;
  const processElapsed  = processingAt.current  ? (frozenAt ?? now) - processingAt.current  : null;

  return (
    <div className="flex flex-col gap-4">

      {/* Statut global + message SSE */}
      <div className="flex items-center gap-2">
        {isRunning
          ? <LoaderIcon className="size-4 shrink-0 animate-spin text-muted-foreground" />
          : isDone
            ? <CheckIcon className="size-4 shrink-0 text-green-500" />
            : <XIcon className="size-4 shrink-0 text-destructive" />
        }
        <span className="font-medium text-sm truncate">
          {job.message ?? (isDone ? "Vidéo prête" : isFailed ? "Erreur" : job.status === "cancelled" ? "Annulé" : "En attente…")}
        </span>
        {totalElapsed !== null && (
          <span className="ml-auto font-mono text-sm tabular-nums text-muted-foreground shrink-0">
            {formatElapsed(totalElapsed)}
          </span>
        )}
      </div>

      {/* Phase téléchargement */}
      {downloadingAt.current && (
        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            {isDownloading
              ? <LoaderIcon className="size-3.5 shrink-0 animate-spin text-blue-500" />
              : isCancelled && !processingAt.current
                ? <XIcon className="size-3.5 shrink-0 text-destructive" />
                : <CheckIcon className="size-3.5 shrink-0 text-green-500" />
            }
            <span>Téléchargement</span>
            {downloadElapsed !== null && (
              <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
                {formatElapsed(downloadElapsed)}
              </span>
            )}
          </div>

          {job.clips && job.clips.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              {job.clips.map((clip, i) => {
                const timer = clipTimers.current.get(clip.id);
                const clipElapsed = timer
                  ? (timer.end ?? (clip.status === "downloading" ? now : null))
                    ? formatElapsed((timer.end ?? now) - timer.start)
                    : null
                  : null;

                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {clip.status === "done" && <CheckIcon className="size-3.5 shrink-0 text-green-500" />}
                    {clip.status === "downloading" && (isCancelled ? <XIcon className="size-3.5 shrink-0 text-destructive" /> : <LoaderIcon className="size-3.5 shrink-0 animate-spin text-blue-500" />)}
                    {clip.status === "pending" && (isCancelled ? <XIcon className="size-3.5 shrink-0 text-destructive" /> : <ClockIcon className="size-3.5 shrink-0 text-muted-foreground" />)}
                    <span className="text-muted-foreground shrink-0">{clip.id}</span>
                    <span className="truncate">{clip.title}</span>
                    {clipElapsed && (
                      <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground shrink-0">
                        {clipElapsed}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Phase assemblage */}
      {processingAt.current && (
        <div className="flex items-center gap-2 rounded-md border border-border p-3 text-sm font-medium">
          {isProcessing
            ? <LoaderIcon className="size-3.5 shrink-0 animate-spin text-blue-500" />
            : isCancelled && !doneAt.current
              ? <XIcon className="size-3.5 shrink-0 text-destructive" />
              : <CheckIcon className="size-3.5 shrink-0 text-green-500" />
          }
          <span>Assemblage</span>
          {processElapsed !== null && (
            <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
              {formatElapsed(processElapsed)}
            </span>
          )}
        </div>
      )}

      {/* Erreur */}
      {isFailed && job.error && (
        <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
          {job.error}
        </p>
      )}

    </div>
  );
}
