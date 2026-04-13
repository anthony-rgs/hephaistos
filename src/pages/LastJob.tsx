import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RenderProgress } from "@/components";
import { CardFooter } from "@/components/ui/card";
import PhoneMockup, { PHONE_CHROME_H } from "@/components/PhoneMockup";
import { useAppDispatch, useAppSelector } from "@/store";
import { setJob, updateJob } from "@/store/renderSlice";
import {
  getLastJob,
  subscribeToJob,
  cancelRender,
  getVideoObjectUrl,
  downloadVideo,
} from "@/utils/api/render";
import { DownloadIcon } from "lucide-react";

const screenH = `calc(100vh - 96px - ${PHONE_CHROME_H}px)`;

export default function LastJob() {
  const dispatch = useAppDispatch();
  const job = useAppSelector((s) => s.render.job);

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [noJob, setNoJob] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const isRunning =
    job !== null && ["pending", "downloading", "processing"].includes(job.status);
  const isDone = job?.status === "done";

  // Charge le dernier job + lance le stream
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

  // Charge la vidéo quand done
  useEffect(() => {
    if (job?.status === "done" && job.job_id) {
      getVideoObjectUrl(job.job_id)
        .then(setVideoUrl)
        .catch((err) => console.error("Failed to load video preview:", err));
    }
  }, [job?.status, job?.job_id]);

  // Libère le blob URL
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

  const leftAction = isRunning ? (
    <Button variant="destructive" onClick={handleCancel}>
      Annuler
    </Button>
  ) : (
    <Button variant="ghost" onClick={() => navigate("/create-video")}>
      Créer une vidéo
    </Button>
  );

  const rightAction =
    isDone && job?.job_id ? (
      <Button onClick={() => downloadVideo(job.job_id).catch((err) => console.error("Download failed:", err))}>
        <DownloadIcon className="size-4" />
        Télécharger
      </Button>
    ) : (
      <div className="w-20" />
    );

  return (
    <section className="flex gap-12 px-12">
      <div className="w-full h-[calc(100vh-3.5rem)] py-12">
        <Card className="h-full">
          <CardHeader className="justify-center">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              Dernier rendu
            </h3>
          </CardHeader>

          <Separator />

          <div className="overflow-scroll p-4 pt-0 h-full flex flex-col gap-4">
            {noJob ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <p className="text-muted-foreground">Aucun rendu en mémoire.<br />Lance d'abord une création !</p>
                <Button onClick={() => navigate("/create-video")}>
                  Créer une vidéo
                </Button>
              </div>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <>
                {job && (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{job.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(job.created_at).toLocaleString("fr-FR", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                )}
                <RenderProgress />
              </>
            )}
          </div>

          <CardFooter className="flex justify-between">
            {leftAction}
            {rightAction}
          </CardFooter>
        </Card>
      </div>

      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] py-12">
        <PhoneMockup>
          <div style={{ height: screenH, aspectRatio: "9/16" }}>
            {videoUrl ? (
              <video
                src={videoUrl}
                autoPlay
                loop
                playsInline
                controls
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : null}
          </div>
        </PhoneMockup>
      </div>
    </section>
  );
}
