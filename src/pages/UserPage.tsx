import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOutIcon,
  FilmIcon,
  ShieldCheckIcon,
  DownloadIcon,
  QrCodeIcon,
  LoaderIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/authSlice";
import { getMe, type MeJob, type MeResponse } from "@/utils/api/auth";
import { getVideoObjectUrl, downloadVideo } from "@/utils/api/render";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} Go`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} Mo`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} Ko`;
  return `${bytes} o`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}min${s > 0 ? ` ${s}s` : ""}`;
  return `${seconds}s`;
}

function FeatureBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-400/10 text-violet-400 border border-violet-400/20">
      {label}
    </span>
  );
}

// ─── QR dialog ────────────────────────────────────────────────────────────────

function QrDialog({
  open,
  onClose,
  jobId,
  title,
}: {
  open: boolean;
  onClose: () => void;
  jobId: string;
  title: string;
}) {
  const token = localStorage.getItem("token") ?? "";
  const url = `${window.location.origin}/render/${jobId}?token=${token}`;
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
    >
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-4 h-px bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase truncate">
              {title}
            </span>
          </div>
          <DialogTitle className="font-black uppercase tracking-tighter text-xl">
            QR Code
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center p-4">
          <QRCodeSVG
            value={url}
            size={180}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Job row ──────────────────────────────────────────────────────────────────

function JobRow({
  job,
  idx,
  isActive,
  selectedJobId,
  onSelect,
}: {
  job: MeJob;
  idx: number;
  isActive: boolean;
  selectedJobId: string | null;
  onSelect: (id: string) => void;
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const isDone = job.status === "done";
  const isSelected = selectedJobId === job.job_id;

  return (
    <>
      <div
        className={`group flex items-center gap-2 text-xs rounded-lg px-2 h-8 transition-colors ${
          isActive
            ? "bg-violet-400/5"
            : isSelected
              ? "bg-violet-400/10"
              : isDone
                ? "hover:bg-muted/60"
                : ""
        }`}
      >
        <span className="text-[10px] text-foreground/40 shrink-0 w-5 tabular-nums font-semibold">
          {idx}/
        </span>

        <button
          onClick={isDone ? () => onSelect(job.job_id) : undefined}
          disabled={!isDone}
          className={`font-medium truncate flex-1 text-left ${
            isActive
              ? "text-violet-400 animate-pulse"
              : isSelected
                ? "text-violet-400"
                : isDone
                  ? "text-muted-foreground hover:text-foreground cursor-pointer"
                  : "text-muted-foreground/50 cursor-default"
          }`}
        >
          {job.title}
        </button>

        {isActive && (
          <span className="text-[10px] text-violet-400/70 shrink-0 font-medium">
            {job.status}
          </span>
        )}

        {isDone && (
          <div className="shrink-0 flex items-center justify-end gap-2">
            {(job.file_size_bytes != null || job.duration_seconds != null) && (
              <span className="text-[10px] text-muted-foreground/50 tabular-nums group-hover:hidden flex items-center gap-2">
                {job.duration_seconds != null && (
                  <span>{formatDuration(job.duration_seconds)}</span>
                )}
                {job.file_size_bytes != null && (
                  <span>{formatBytes(job.file_size_bytes)}</span>
                )}
              </span>
            )}
            <div className="hidden group-hover:flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[10px] font-semibold text-muted-foreground hover:text-foreground gap-1"
                onClick={() =>
                  downloadVideo(job.job_id).catch(() =>
                    toast.error("Erreur de téléchargement."),
                  )
                }
              >
                <DownloadIcon className="size-3" />
                Télécharger
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[10px] font-semibold text-muted-foreground hover:text-violet-400 gap-1"
                onClick={() => setQrOpen(true)}
              >
                <QrCodeIcon className="size-3" />
                QR
              </Button>
            </div>
          </div>
        )}
      </div>

      <QrDialog
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        jobId={job.job_id}
        title={job.title}
      />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const storeUsername = useAppSelector((s) => s.auth.username);

  const [me, setMe] = useState<MeResponse | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const videoUrlRef = useRef<string | null>(null);

  useEffect(() => {
    getMe()
      .then(setMe)
      .catch(() => toast.error("Impossible de charger le profil."));
  }, []);

  useEffect(() => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = null;
    }
    setVideoUrl(null);
    if (!selectedJobId) return;

    let cancelled = false;
    setVideoLoading(true);
    getVideoObjectUrl(selectedJobId)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        videoUrlRef.current = url;
        setVideoUrl(url);
      })
      .catch(() => {
        if (!cancelled) toast.error("Impossible de charger la vidéo.");
      })
      .finally(() => {
        if (!cancelled) setVideoLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedJobId]);

  useEffect(() => {
    return () => {
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/logging");
  };

  const allJobs: (MeJob & { isActive: boolean })[] = [
    ...(me?.active_jobs ?? []).map((j) => ({ ...j, isActive: true })),
    ...(me?.done_jobs ?? []).map((j) => ({ ...j, isActive: false })),
  ];

  return (
    <section className="relative overflow-hidden flex gap-12 px-12">
      {/* Background glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-600 blur-[130px] opacity-15" />
      <div className="pointer-events-none absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-indigo-600 blur-[120px] opacity-10" />

      {/* ── Left column ── */}
      <div className="w-full h-[calc(100vh-3.5rem)] flex flex-col relative z-10">
        {/* Global header */}
        <div className="shrink-0 pt-8 pb-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-4 h-px bg-violet-400" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                Profil
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
                {me?.username ?? storeUsername ?? "—"}
              </h2>
              {me?.is_admin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-violet-400/10 text-violet-400 border border-violet-400/20">
                  <ShieldCheckIcon className="size-3" /> Admin
                </span>
              )}
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0 mt-1 gap-1.5"
            onClick={handleLogout}
          >
            <LogOutIcon className="size-3.5" />
            Se déconnecter
          </Button>
        </div>
        <div className="h-px bg-border shrink-0" />

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-6 flex flex-col gap-8">
          {/* ── Statistiques / Activité ── */}
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-3 h-px bg-violet-400" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                  Statistiques
                </span>
              </div>
              <h3 className="text-base font-black uppercase tracking-tighter leading-none">
                Activité
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {me ? (
                <>
                  <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/10 px-3 py-2.5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                      Vidéos créées
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {me.total_videos_created}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/10 px-3 py-2.5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                      Clips utilisés
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {me.total_clips_used}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/10 px-3 py-2.5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                      Contenu généré
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatDuration(me.total_duration_seconds)}
                    </span>
                  </div>
                </>
              ) : (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-muted/10 px-3 py-2.5 h-14 animate-pulse"
                  />
                ))
              )}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* ── Accès / Compte ── */}
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-3 h-px bg-violet-400" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                  Accès
                </span>
              </div>
              <h3 className="text-base font-black uppercase tracking-tighter leading-none">
                Compte
              </h3>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold">
                    Fonctionnalités actives
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Ces accès débloquent des options supplémentaires lors de la
                    création de vidéos.
                  </span>
                </div>
                {me ? (
                  me.features.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {me.features.map((f) => (
                        <FeatureBadge
                          key={f}
                          label={f}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/50 italic">
                      Aucune fonctionnalité activée.
                    </span>
                  )
                ) : (
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold">
                  {me
                    ? `${me.done_jobs.length + me.active_jobs.length} / ${me.max_jobs} job${me.max_jobs > 1 ? "s" : ""}`
                    : "— / —"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Nombre de rendus utilisés sur ton quota total. Les jobs
                  terminés comptent dans la limite.
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* ── Mes rendus / Vidéos ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-3 h-px bg-violet-400" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                    Mes rendus
                  </span>
                </div>
                <h3 className="text-base font-black uppercase tracking-tighter leading-none">
                  Vidéos
                </h3>
              </div>
              <Button
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => navigate("/create-video")}
              >
                <FilmIcon className="size-3.5" />
                Créer une vidéo
              </Button>
            </div>

            <div className="flex flex-col gap-0.5">
              {!me ? (
                <div className="flex items-center justify-center py-16">
                  <LoaderIcon className="size-6 text-muted-foreground animate-spin" />
                </div>
              ) : allJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center px-8">
                  <div className="size-14 rounded-2xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
                    <FilmIcon className="size-6 text-violet-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold tracking-tight text-sm">
                      Aucun rendu
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Lance une création pour voir tes vidéos ici.
                    </p>
                  </div>
                </div>
              ) : (
                allJobs.map((job, idx) => (
                  <JobRow
                    key={job.job_id}
                    job={job}
                    idx={idx + 1}
                    isActive={job.isActive}
                    selectedJobId={selectedJobId}
                    onSelect={setSelectedJobId}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right column ── */}
      <div className="flex flex-col h-[calc(100vh-3.5rem)] py-8 shrink-0 relative z-10">
        <div className="shrink-0 pb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-4 h-px bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
              Aperçu
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
            {selectedJobId ? "Vidéo" : "Aperçu"}
          </h2>
        </div>
        <div className="h-px bg-border shrink-0" />
        <div className="flex-1 flex items-center justify-center pt-6">
          <div
            className="border border-border rounded-2xl overflow-hidden shrink-0"
            style={{
              height: "calc(100vh - 3.5rem - 4rem - 100px)",
              aspectRatio: "9/16",
            }}
          >
            {selectedJobId && videoLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-muted/20">
                <LoaderIcon className="size-5 text-muted-foreground animate-spin" />
              </div>
            ) : selectedJobId && videoUrl ? (
              <video
                key={selectedJobId}
                src={videoUrl}
                autoPlay
                loop
                playsInline
                controls
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 bg-muted/10">
                <FilmIcon className="size-5 text-muted-foreground/40" />
                <p className="text-[10px] font-medium text-muted-foreground/50 text-center leading-relaxed">
                  Clique sur un rendu terminé
                  <br />
                  pour le prévisualiser
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
