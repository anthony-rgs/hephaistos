import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RenderJobContent } from "@/components";
import { useAppDispatch, useAppSelector } from "@/store";
import { setJob, updateJob } from "@/store/renderSlice";
import {
  getLastJob,
  subscribeToJob,
  cancelRender,
  getVideoObjectUrl,
  downloadVideo,
} from "@/utils/api/render";
import { DownloadIcon, FilmIcon } from "lucide-react";

export default function LastJob() {
  const dispatch = useAppDispatch();
  const job = useAppSelector((s) => s.render.job);
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [noJob, setNoJob] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const isRunning =
    job !== null &&
    ["pending", "downloading", "processing"].includes(job.status);
  const isDone = job?.status === "done";

  useEffect(() => {
    if (window.innerWidth < 1024) return;
    let cancelled = false;
    setError(null);

    getLastJob()
      .then((lastJob) => {
        if (cancelled) return;
        dispatch(setJob(lastJob));
        cleanupRef.current = subscribeToJob(lastJob.job_id, dispatch);
      })
      .catch((err: { status?: number }) => {
        if (cancelled) return;
        if (err?.status === 404) setNoJob(true);
        else setError("Impossible de récupérer le dernier job.");
      });

    return () => {
      cancelled = true;
      cleanupRef.current?.();
    };
  }, [dispatch]);

  useEffect(() => {
    if (job?.status === "done" && job.job_id) {
      getVideoObjectUrl(job.job_id)
        .then(setVideoUrl)
        .catch((err) => console.error("Failed to load video preview:", err));
    }
  }, [job?.status, job?.job_id]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const handleCancel = () => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    const jobId = job?.job_id;
    dispatch(updateJob({ status: "cancelled" }));
    setVideoUrl(null);
    if (jobId) cancelRender(jobId).catch(() => null);
  };

  return (
    <section className="flex gap-12 px-12">
      {/* ── Panneau gauche ── */}
      <div className="w-full h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Header */}
        <div className="shrink-0 pt-8 pb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-4 h-px bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
              Rendu
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
            Dernier rendu
          </h2>
        </div>

        <div className="h-px bg-border shrink-0" />

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-6 flex flex-col gap-4">
          {noJob ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
              <div className="size-16 rounded-2xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
                <FilmIcon className="size-7 text-violet-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-center gap-2 mb-0.5">
                  <span className="w-4 h-px bg-violet-400" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                    Vide
                  </span>
                  <span className="w-4 h-px bg-violet-400" />
                </div>
                <p className="font-semibold tracking-tight">
                  Aucun rendu en mémoire
                </p>
                <p className="text-sm text-muted-foreground">
                  Lance d'abord une création pour voir ta vidéo ici.
                </p>
              </div>
              <Button onClick={() => navigate("/create-video")}>
                Créer une vidéo
              </Button>
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <RenderJobContent showMeta />
          )}
        </div>

        <div className="h-px bg-border shrink-0" />

        {/* Footer */}
        <div className="flex items-center justify-between py-4 shrink-0">
          {/* Left action */}
          {isRunning ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
            >
              Annuler
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/create-video")}
            >
              Créer une vidéo
            </Button>
          )}

          {/* Center — status badge */}
          {job && (
            <div className="flex items-center gap-2">
              <span
                className={`size-1.5 rounded-full shrink-0 ${
                  isDone
                    ? "bg-green-500"
                    : isRunning
                      ? "bg-violet-400 animate-pulse"
                      : "bg-muted-foreground/40"
                }`}
              />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                {isDone ? "Terminé" : isRunning ? "En cours" : job.status}
              </span>
            </div>
          )}

          {/* Right action */}
          {isDone && job?.job_id ? (
            <Button
              size="sm"
              onClick={() =>
                downloadVideo(job.job_id).catch((err) =>
                  console.error("Download failed:", err),
                )
              }
            >
              <DownloadIcon className="size-3.5" />
              Télécharger
            </Button>
          ) : (
            <div className="w-22.5" />
          )}
        </div>
      </div>

      {/* ── Panneau droit — aperçu ── */}
      <div className="flex flex-col h-[calc(100vh-3.5rem)] py-8 shrink-0">
        {/* Header */}
        <div className="shrink-0 pb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-4 h-px bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
              Aperçu
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
            {isDone ? "Rendu final" : isRunning ? "En cours…" : "Rendu"}
          </h2>
        </div>

        <div className="h-px bg-border shrink-0" />

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center pt-6">
          <div
            className="border border-border rounded-2xl overflow-hidden shrink-0"
            style={{
              height: "calc(100vh - 3.5rem - 4rem - 100px)",
              aspectRatio: "9/16",
            }}
          >
            {isDone && videoUrl ? (
              <video
                src={videoUrl}
                autoPlay
                loop
                playsInline
                controls
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
                <div className="w-full h-full rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2">
                  <FilmIcon className="size-5 text-muted-foreground" />
                  <p className="text-[10px] font-medium text-muted-foreground text-center leading-relaxed">
                    La vidéo apparaîtra
                    <br />
                    ici une fois rendue
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
