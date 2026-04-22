import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { DownloadIcon } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8001";

async function saveVideo(blob: Blob) {
  const file = new File([blob], "video.mp4", { type: "video/mp4" });

  // iOS Safari + Android Chrome moderne : share sheet natif → "Enregistrer dans Photos"
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "Vidéo" });
    return;
  }

  // Fallback : lien de téléchargement classique (Android Chrome, desktop)
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "video.mp4";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function RenderView() {
  const { jobId } = useParams<{ jobId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!jobId || !token) {
      setError("Lien invalide.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/jobs/${jobId}/download`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Vidéo non disponible");
        if (!res.body) throw new Error("Stream non supporté");

        const reader = res.body.getReader();
        const chunks: Uint8Array<ArrayBuffer>[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const b = new Blob(chunks, { type: "video/mp4" });
        setBlob(b);
        setVideoUrl(URL.createObjectURL(b));
      } catch (err) {
        if ((err as { name?: string }).name !== "AbortError") {
          setError("Impossible de charger la vidéo.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => { controller.abort(); };
  }, [jobId, token]);

  useEffect(() => {
    return () => { if (videoUrl) URL.revokeObjectURL(videoUrl); };
  }, [videoUrl]);

  const handleSave = async () => {
    if (!blob) return;
    setSaving(true);
    try {
      await saveVideo(blob);
    } catch {
      // L'utilisateur a annulé le share sheet — pas une erreur
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black px-6 text-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      {videoUrl && (
        <video
          src={videoUrl}
          autoPlay
          loop
          playsInline
          controls
          className="h-full w-full object-contain"
        />
      )}

      {blob && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="absolute bottom-8 right-4 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 text-sm font-semibold text-black shadow-lg active:scale-95 disabled:opacity-50"
        >
          <DownloadIcon className="size-4" />
          {saving ? "..." : "Enregistrer"}
        </button>
      )}
    </div>
  );
}
