import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateJob } from "@/store/renderSlice";
import { subscribeToJobCallback } from "@/utils/api/render";

const RUNNING = new Set(["pending", "downloading", "processing"]);

export function useRenderNotifier() {
  const dispatch = useAppDispatch();
  const job = useAppSelector((s) => s.render.job);
  const { pathname } = useLocation();
  const prevStatusRef = useRef<string | undefined>(undefined);

  // Toast on done / failed — fires regardless of current page
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = job?.status;
    if (prev === undefined || !job) return; // skip mount
    const formatJobDate = (iso: string) => {
      const d = new Date(iso);
      const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h");
      const day = d.getDate();
      const month = d.toLocaleDateString("fr-FR", { month: "long" });
      return `Rendu ${time} le ${day} ${month}`;
    };
    const label = job.created_at ? formatJobDate(job.created_at) : "Rendu";
    if (job.status === "done" && prev !== "done") {
      toast.success(`${label} terminé !`);
    } else if (job.status === "failed" && prev !== "failed") {
      toast.error(`${label} échoué — ${job.error ?? "Erreur inconnue"}`);
    }
  }, [job?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // SSE subscriber — only when off /create-video (that page manages its own stream)
  useEffect(() => {
    if (pathname === "/create-video") return;
    if (!job?.job_id || !RUNNING.has(job.status)) return;

    const jobId = job.job_id;
    return subscribeToJobCallback(jobId, (data) => dispatch(updateJob(data)));
  }, [job?.job_id, pathname]); // eslint-disable-line react-hooks/exhaustive-deps
}
