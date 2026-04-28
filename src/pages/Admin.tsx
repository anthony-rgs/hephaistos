import React, { useEffect, useRef, useState } from "react";
import {
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
  ShieldOffIcon,
  FilmIcon,
  PencilIcon,
  ShieldCheckIcon,
  CheckIcon,
  XIcon,
  LoaderIcon,
  EyeIcon,
  EyeOffIcon,
  DownloadIcon,
  QrCodeIcon,
  CpuIcon,
  HardDriveIcon,
  MemoryStickIcon,
  ActivityIcon,
  LayersIcon,
  BanknoteIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getAdminUsers,
  createAdminUser,
  patchAdminUser,
  revokeUserTokens,
  deleteAdminUser,
  getSystemMetrics,
  patchAdminMetrics,
  type AdminUser,
  type SystemMetrics,
} from "@/utils/api/admin";
import {
  getVideoObjectUrl,
  downloadVideo,
  cancelRender,
  getPublicMetrics,
  type PublicMetrics,
} from "@/utils/api/render";
import { useAppDispatch, useAppSelector } from "@/store";
import { setUserData } from "@/store/authSlice";
import { getMe } from "@/utils/api/auth";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FeatureBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-400/10 text-violet-400 border border-violet-400/20">
      {label}
    </span>
  );
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}min${s > 0 ? ` ${s}s` : ""}`;
  return `${seconds}s`;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} Go`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} Mo`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} Ko`;
  return `${bytes.toFixed(1)} o`;
}

function MetricCard({
  Icon,
  label,
  value,
  sub,
}: {
  Icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/10 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3" />
        <span className="text-[10px] font-bold tracking-wider uppercase">
          {label}
        </span>
      </div>
      <span className="text-sm font-semibold tabular-nums leading-none">
        {value}
      </span>
      {sub && (
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {sub}
        </span>
      )}
    </div>
  );
}

// ─── QR code dialog ───────────────────────────────────────────────────────────

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

// ─── Create / Edit dialog ─────────────────────────────────────────────────────

interface UserFormData {
  username: string;
  password: string;
  is_admin: boolean;
  features: string;
  max_jobs: number;
}

const EMPTY_FORM: UserFormData = {
  username: "",
  password: "",
  is_admin: false,
  features: "",
  max_jobs: 1,
};

function UserDialog({
  open,
  onClose,
  onSave,
  initial,
  mode,
  username,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void>;
  initial?: Partial<UserFormData>;
  mode: "create" | "edit";
  username?: string;
}) {
  const [form, setForm] = useState<UserFormData>({ ...EMPTY_FORM, ...initial });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM, ...initial });
      setShowPwd(false);
    }
  }, [open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      toast.error(
        mode === "create"
          ? "Erreur lors de la création."
          : "Erreur lors de la modification.",
      );
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof UserFormData) => (v: string | boolean | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-4 h-px bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
              {mode === "create" ? "Administration" : username}
            </span>
          </div>
          <DialogTitle className="font-black uppercase tracking-tighter text-2xl">
            {mode === "create"
              ? "Nouvel utilisateur"
              : "Modifier l'utilisateur"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {mode === "create" && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                Nom d'utilisateur
              </Label>
              <Input
                value={form.username}
                onChange={(e) => set("username")(e.target.value)}
                placeholder="paul"
                autoComplete="off"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
              {mode === "create" ? "Mot de passe" : "Nouveau mot de passe"}
            </Label>
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password")(e.target.value)}
                placeholder={
                  mode === "edit"
                    ? "Laisser vide pour ne pas changer"
                    : "••••••••"
                }
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-violet-400 transition-colors"
              >
                {showPwd ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
              Features (séparées par virgule)
            </Label>
            <Input
              value={form.features}
              onChange={(e) => set("features")(e.target.value)}
              placeholder="claude, beta"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
              Max jobs
            </Label>
            <Input
              type="number"
              min={1}
              value={form.max_jobs}
              onChange={(e) => set("max_jobs")(Number(e.target.value))}
            />
          </div>

          {mode === "create" && (
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <span className="text-sm font-medium">Administrateur</span>
              <Switch
                checked={form.is_admin}
                onCheckedChange={(v) => set("is_admin")(v)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              loading ||
              (mode === "create" &&
                (!form.username.trim() || !form.password.trim()))
            }
          >
            {loading ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <CheckIcon className="size-4" />
            )}
            {mode === "create" ? "Créer" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  danger,
  username,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  danger?: boolean;
  username?: string;
}) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          {username && (
            <div className="flex items-center gap-2 mb-1">
              <span className="w-4 h-px bg-violet-400" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                {username}
              </span>
            </div>
          )}
          <DialogTitle className="font-black uppercase tracking-tighter text-xl">
            {title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant={danger ? "destructive" : "default"}
            onClick={handle}
            disabled={loading}
          >
            {loading ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <CheckIcon className="size-4" />
            )}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── User row ─────────────────────────────────────────────────────────────────

function UserRow({
  user,
  onAction,
  onSelectJob,
  selectedJobId,
  onJobDeleted,
}: {
  user: AdminUser;
  onAction: () => void;
  onSelectJob: (jobId: string) => void;
  selectedJobId: string | null;
  onJobDeleted: (jobId: string) => void;
}) {
  const dispatch = useAppDispatch();
  const currentUsername = useAppSelector((s) => s.auth.username);
  const isSelf = user.username === currentUsername;

  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<"revoke" | "delete" | null>(null);
  const [confirmDeleteJob, setConfirmDeleteJob] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [qrJob, setQrJob] = useState<{ id: string; title: string } | null>(
    null,
  );

  const handleEdit = async (form: UserFormData) => {
    const features = form.features
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const body: Record<string, unknown> = { features, max_jobs: form.max_jobs };
    if (form.password) body.password = form.password;
    await patchAdminUser(user.id, body);
    toast.success(`"${user.username}" mis à jour.`);
    if (isSelf) {
      getMe()
        .then((me) =>
          dispatch(
            setUserData({
              username: me.username,
              isAdmin: me.is_admin,
              features: me.features,
              maxJobs: me.max_jobs,
            }),
          ),
        )
        .catch(() => {});
    }
    onAction();
  };

  const handleRevoke = async () => {
    await revokeUserTokens(user.id);
    toast.success("Tokens révoqués.");
    onAction();
  };
  const handleDelete = async () => {
    await deleteAdminUser(user.id);
    toast.success(`"${user.username}" supprimé.`);
    onAction();
  };
  const handleDeleteVideo = async () => {
    const id = confirmDeleteJob!.id;
    await cancelRender(id);
    toast.success("Vidéo supprimée.");
    onJobDeleted(id);
    onAction();
  };

  return (
    <>
      <div className="grid grid-cols-[1fr_auto] gap-4 rounded-xl border border-border bg-muted/10 hover:border-violet-400/30 transition-colors duration-200 p-4 lg:p-5">
        {/* Left */}
        <div className="flex flex-col gap-3 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm">{user.username}</span>
            {user.is_admin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-violet-400/10 text-violet-400 border border-violet-400/20">
                <ShieldCheckIcon className="size-3" /> Admin
              </span>
            )}
            {user.features.map((f) => (
              <FeatureBadge
                key={f}
                label={f}
              />
            ))}
            <span className="text-[10px] text-muted-foreground ml-auto">
              max {user.max_jobs} job{user.max_jobs > 1 ? "s" : ""}
            </span>
          </div>

          {/* User stats */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-muted-foreground/60 tabular-nums">
              <span className="font-semibold text-foreground/70">
                {user.total_videos_created}
              </span>{" "}
              vidéo{user.total_videos_created !== 1 ? "s" : ""}
            </span>
            <span className="text-[10px] text-muted-foreground/60 tabular-nums">
              <span className="font-semibold text-foreground/70">
                {user.total_clips_used}
              </span>{" "}
              clip{user.total_clips_used !== 1 ? "s" : ""}
            </span>
            <span className="text-[10px] text-muted-foreground/60 tabular-nums">
              <span className="font-semibold text-foreground/70">
                {formatDuration(user.total_duration_seconds)}
              </span>{" "}
              de contenu
            </span>
          </div>

          {/* Jobs list */}
          {user.jobs?.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {user.jobs.slice(0, 5).map((job, idx) => {
                const isDone = job.status === "done";
                const isSelected = selectedJobId === job.id;
                return (
                  <div
                    key={job.id}
                    className={`group flex items-center gap-2 text-xs rounded-lg px-2 h-8 transition-colors ${
                      isSelected
                        ? "bg-violet-400/10"
                        : isDone
                          ? "hover:bg-muted/60"
                          : ""
                    }`}
                  >
                    <span className="text-[10px] text-foreground/40 shrink-0 w-5 tabular-nums font-semibold">
                      {idx + 1}/
                    </span>
                    <button
                      onClick={isDone ? () => onSelectJob(job.id) : undefined}
                      disabled={!isDone}
                      className={`font-medium truncate flex-1 text-left ${
                        isSelected
                          ? "text-violet-400"
                          : isDone
                            ? "text-muted-foreground hover:text-foreground cursor-pointer"
                            : "text-muted-foreground/50 cursor-default"
                      }`}
                    >
                      {job.title}
                    </button>
                    <div className="shrink-0 flex items-center justify-end gap-2">
                      {(job.file_size_bytes != null ||
                        job.duration_seconds != null) && (
                        <span className="text-[10px] text-muted-foreground/50 tabular-nums group-hover:hidden flex items-center gap-2">
                          {job.duration_seconds != null && (
                            <span>{formatDuration(job.duration_seconds)}</span>
                          )}
                          {job.file_size_bytes != null && (
                            <span>{formatBytes(job.file_size_bytes)}</span>
                          )}
                        </span>
                      )}
                      {isDone && (
                        <div className="hidden group-hover:flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-[10px] font-semibold text-muted-foreground hover:text-foreground gap-1"
                            onClick={() =>
                              downloadVideo(job.id).catch(() =>
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
                            onClick={() =>
                              setQrJob({ id: job.id, title: job.title })
                            }
                          >
                            <QrCodeIcon className="size-3" />
                            QR
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-[10px] font-semibold text-muted-foreground hover:text-destructive gap-1"
                            onClick={() =>
                              setConfirmDeleteJob({
                                id: job.id,
                                title: job.title,
                              })
                            }
                          >
                            <TrashIcon className="size-3" />
                            Supprimer
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {user.jobs.length > 5 && (
                <span className="text-[10px] text-muted-foreground/40 pl-2 pt-0.5">
                  +{user.jobs.length - 5} de plus
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground/50 italic">
              Aucun rendu
            </span>
          )}

          {/* Created */}
          <span className="text-[10px] text-muted-foreground/40">
            Créé le{" "}
            {new Date(user.created_at).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Actions */}
        <TooltipProvider>
          <div className="flex flex-col gap-1.5 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditOpen(true)}
                >
                  <PencilIcon className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Modifier</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-yellow-400"
                  onClick={() => setConfirm("revoke")}
                >
                  <ShieldOffIcon className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Révoquer les tokens</TooltipContent>
            </Tooltip>
            {!isSelf && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setConfirm("delete")}
                  >
                    <TrashIcon className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  Supprimer l'utilisateur
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>

      <UserDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleEdit}
        initial={{
          features: user.features.join(", "),
          max_jobs: user.max_jobs,
        }}
        mode="edit"
        username={user.username}
      />

      <ConfirmDialog
        open={confirm === "revoke"}
        onClose={() => setConfirm(null)}
        onConfirm={handleRevoke}
        title="Révoquer les tokens"
        description={`Tous les tokens actifs seront invalidés. L'utilisateur sera déconnecté.`}
        username={user.username}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        description="Cet utilisateur sera définitivement supprimé. Cette action est irréversible."
        danger
        username={user.username}
      />
      <ConfirmDialog
        open={confirmDeleteJob !== null}
        onClose={() => setConfirmDeleteJob(null)}
        onConfirm={handleDeleteVideo}
        title="Supprimer la vidéo"
        description="Cette vidéo sera supprimée du serveur. Cette action est irréversible."
        danger
        username={confirmDeleteJob?.title}
      />
      <QrDialog
        open={qrJob !== null}
        onClose={() => setQrJob(null)}
        jobId={qrJob?.id ?? ""}
        title={qrJob?.title ?? ""}
      />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Admin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const videoUrlRef = useRef<string | null>(null);

  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [netRate, setNetRate] = useState({ sent: 0, recv: 0 });
  const prevMetricsRef = useRef<{ data: SystemMetrics; time: number } | null>(
    null,
  );

  const [siteMetrics, setSiteMetrics] = useState<PublicMetrics | null>(null);
  const [moneyEdit, setMoneyEdit] = useState(false);
  const [moneyValue, setMoneyValue] = useState("");
  const [moneySaving, setMoneySaving] = useState(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await getSystemMetrics();
        if (prevMetricsRef.current) {
          const dt = (Date.now() - prevMetricsRef.current.time) / 1000;
          setNetRate({
            sent: Math.max(
              0,
              (data.network.bytes_sent -
                prevMetricsRef.current.data.network.bytes_sent) /
                dt,
            ),
            recv: Math.max(
              0,
              (data.network.bytes_recv -
                prevMetricsRef.current.data.network.bytes_recv) /
                dt,
            ),
          });
        }
        prevMetricsRef.current = { data, time: Date.now() };
        setMetrics(data);
      } catch {
        /* silently ignore */
      }
    };
    poll();
    const id = setInterval(poll, 5_000);
    return () => clearInterval(id);
  }, []);

  const fetchSiteMetrics = () =>
    getPublicMetrics()
      .then((d) => {
        setSiteMetrics(d);
        setMoneyValue(String(d.money_earned));
      })
      .catch(() => {});

  useEffect(() => {
    fetchSiteMetrics();
  }, []);

  const handleSaveMoney = async () => {
    const val = parseFloat(moneyValue);
    if (isNaN(val)) return;
    setMoneySaving(true);
    try {
      await patchAdminMetrics({ money_earned: val });
      toast.success("Revenus mis à jour.");
      setMoneyEdit(false);
      fetchSiteMetrics();
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setMoneySaving(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      setUsers(await getAdminUsers());
    } catch {
      toast.error("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const handleCreate = async (form: UserFormData) => {
    await createAdminUser({
      username: form.username,
      password: form.password,
      is_admin: form.is_admin,
      features: form.features
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      max_jobs: form.max_jobs,
    });
    toast.success(`"${form.username}" créé.`);
    fetchUsers();
  };

  return (
    <section className="relative overflow-hidden flex gap-12 px-12">
      {/* Background glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-600 blur-[130px] opacity-15" />
      <div className="pointer-events-none absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-indigo-600 blur-[120px] opacity-10" />

      {/* ── Left column ── */}
      <div className="w-full h-[calc(100vh-3.5rem)] flex flex-col relative z-10">
        {/* Global header */}
        <div className="shrink-0 pt-8 pb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-4 h-px bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
              Administration
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
            Dashboard
          </h2>
        </div>
        <div className="h-px bg-border shrink-0" />

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-5 flex flex-col gap-8">
          {/* Métriques */}
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-3 h-px bg-violet-400" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                  Métriques
                </span>
              </div>
              <h3 className="text-base font-semibold tracking-tight">
                Vue d'ensemble
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {siteMetrics ? (
                <>
                  <MetricCard
                    Icon={FilmIcon}
                    label="Vidéos créées"
                    value={String(siteMetrics.total_videos_created)}
                  />
                  <MetricCard
                    Icon={ActivityIcon}
                    label="Contenu généré"
                    value={formatDuration(siteMetrics.total_duration_seconds)}
                  />
                  <MetricCard
                    Icon={LayersIcon}
                    label="Clips utilisés"
                    value={String(siteMetrics.total_clips_used)}
                  />
                  <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/10 px-3 py-2.5">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <BanknoteIcon className="size-3" />
                        <span className="text-[10px] font-bold tracking-wider uppercase">
                          Revenus
                        </span>
                      </div>
                      {!moneyEdit && (
                        <button
                          onClick={() => {
                            setMoneyValue(String(siteMetrics.money_earned));
                            setMoneyEdit(true);
                          }}
                          className="hover:text-violet-400 transition-colors"
                        >
                          <PencilIcon className="size-3" />
                        </button>
                      )}
                    </div>
                    {moneyEdit ? (
                      <div className="flex flex-col gap-2.5 mt-0.5">
                        <input
                          type="number"
                          value={moneyValue}
                          onChange={(e) => setMoneyValue(e.target.value)}
                          className="w-full bg-transparent text-sm font-semibold tabular-nums leading-none border-b border-violet-400/50 focus:outline-none focus:border-violet-400 pb-0.5"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveMoney();
                            if (e.key === "Escape") setMoneyEdit(false);
                          }}
                        />
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            className="h-6 px-2 text-[10px] flex-1 gap-1"
                            onClick={handleSaveMoney}
                            disabled={moneySaving}
                          >
                            {moneySaving ? (
                              <LoaderIcon className="size-3 animate-spin" />
                            ) : (
                              <CheckIcon className="size-3" />
                            )}
                            Enregistrer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-[10px] flex-1 gap-1"
                            onClick={() => setMoneyEdit(false)}
                          >
                            <XIcon className="size-3" />
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold tabular-nums leading-none">
                        {siteMetrics.money_earned.toFixed(2)} €
                      </span>
                    )}
                  </div>
                </>
              ) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-muted/10 px-3 py-2.5 h-18 animate-pulse"
                  />
                ))
              )}
            </div>
          </div>

          <div className="h-px bg-border shrink-0" />

          {/* Serveur */}
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-3 h-px bg-violet-400" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                  Serveur
                </span>
              </div>
              <h3 className="text-base font-semibold tracking-tight">
                Système
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {metrics ? (
                <>
                  <MetricCard
                    Icon={CpuIcon}
                    label="CPU"
                    value={`${metrics.cpu_percent.toFixed(1)}%`}
                  />
                  <MetricCard
                    Icon={MemoryStickIcon}
                    label="RAM"
                    value={`${metrics.ram.used_gb.toFixed(1)} Go`}
                    sub={`/ ${metrics.ram.total_gb.toFixed(1)} Go`}
                  />
                  <MetricCard
                    Icon={HardDriveIcon}
                    label="Disque"
                    value={`${metrics.disk.used_gb.toFixed(1)} Go`}
                    sub={`${metrics.disk.free_gb.toFixed(1)} Go libre`}
                  />
                  <MetricCard
                    Icon={ActivityIcon}
                    label="Réseau"
                    value={`↑ ${formatBytes(netRate.sent)}/s`}
                    sub={`↓ ${formatBytes(netRate.recv)}/s`}
                  />
                </>
              ) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-muted/10 px-3 py-2.5 h-18 animate-pulse"
                  />
                ))
              )}
            </div>
          </div>

          <div className="h-px bg-border shrink-0" />

          {/* Utilisateurs */}
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-3 h-px bg-violet-400" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                    Utilisateurs
                  </span>
                </div>
                <h3 className="text-base font-semibold tracking-tight">
                  Comptes
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {users.length} utilisateur{users.length !== 1 ? "s" : ""}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsers}
                  disabled={loading}
                  className="h-7 w-7 p-0"
                >
                  <RefreshCwIcon
                    className={`size-3.5 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="h-7 gap-1.5"
                >
                  <PlusIcon className="size-3.5" />
                  Nouvel utilisateur
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {loading && users.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <LoaderIcon className="size-6 text-muted-foreground animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
                  <XIcon className="size-8 opacity-30" />
                  <p className="text-sm">Aucun utilisateur trouvé.</p>
                </div>
              ) : (
                users.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    onAction={fetchUsers}
                    onSelectJob={setSelectedJobId}
                    selectedJobId={selectedJobId}
                    onJobDeleted={(id) => {
                      if (id === selectedJobId) setSelectedJobId(null);
                    }}
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
        <div className="flex-1 flex items-center justify-center pt-5">
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

      <UserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
        mode="create"
      />
    </section>
  );
}
