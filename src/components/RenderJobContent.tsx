import { useAppSelector } from "@/store";
import { QRCodeSVG } from "qrcode.react";
import RenderProgress from "./RenderProgress";

export default function RenderJobContent({ showMeta }: { showMeta?: boolean }) {
  const job = useAppSelector((s) => s.render.job);

  if (!job) return null;

  const token = localStorage.getItem("token") ?? "";
  const qrUrl = `${window.location.origin}/render/${job.job_id}?token=${token}`;

  return (
    <div className="flex flex-col gap-6">

      {showMeta && (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-4 h-px bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">Job</span>
          </div>
          <span className="font-semibold text-sm">{job.title}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(job.created_at).toLocaleString("fr-FR", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </span>
        </div>
      )}

      <RenderProgress />

      {job.status === "done" && job.job_id && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 self-start">
            <span className="w-4 h-px bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">Mobile</span>
          </div>
          <p className="text-xs text-muted-foreground self-start">Scanner pour voir la vidéo sur mobile</p>
          <div className="rounded-xl border border-border p-3 bg-white shadow-sm">
            <QRCodeSVG value={qrUrl} size={130} />
          </div>
        </div>
      )}

    </div>
  );
}
