import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8001";

export default function RenderView() {
  const { jobId } = useParams<{ jobId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        const blob = new Blob(chunks, { type: "video/mp4" });
        setVideoUrl(URL.createObjectURL(blob));
      } catch (err) {
        if ((err as { name?: string }).name !== "AbortError") {
          setError("Impossible de charger la vidéo.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      controller.abort();
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, token]);

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
    </div>
  );
}
