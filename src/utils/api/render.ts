import type { AppDispatch } from "@/store";
import { updateJob } from "@/store/renderSlice";
import type { RenderJob } from "@/store/renderSlice";
import type { CreateVideoState } from "@/store/createVideoSlice";

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8001";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Body builder ─────────────────────────────────────────────────────────────

export function buildRenderBody(state: CreateVideoState): object {
  const f = state.templateFeatures;
  return {
    template: state.templateValue,
    background: state.background,
    teaserTop: state.teaserTop,
    title: state.globalTitle,
    ...(f.includes("videoMargin") && { videoMargin: state.videoMargin }),
    ...(f.includes("spacing") && { spacing: state.spacing }),
    ...(f.includes("smoothTransition") && {
      smoothTransition: state.smoothTransition,
    }),
    ...(f.includes("watermark") && { watermark: state.watermark }),
    ...(f.includes("highlightActive") && {
      highlightActive: state.highlightActive,
    }),
    data: state.clips,
  };
}

// ─── GET /jobs/last ───────────────────────────────────────────────────────────

export async function getLastJob(): Promise<RenderJob> {
  const res = await fetch(`${BASE_URL}/jobs/last`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error("No last job"), { status: res.status, detail: err });
  }
  return res.json();
}

// ─── POST /jobs/render ────────────────────────────────────────────────────────

export async function startRender(body: object): Promise<RenderJob> {
  const res = await fetch(`${BASE_URL}/jobs/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error("Render failed"), {
      status: res.status,
      detail: err,
    });
  }

  return res.json();
}

// ─── GET /jobs/{job_id}/stream ───────────────────────────────────────────────
// fetch + ReadableStream pour pouvoir envoyer le header Authorization

export function subscribeToJob(jobId: string, dispatch: AppDispatch): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${BASE_URL}/jobs/${jobId}/stream`, {
        headers: authHeaders(),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data: Partial<RenderJob> = JSON.parse(line.slice(6));
            dispatch(updateJob(data));
            if (data.status === "done" || data.status === "failed" || data.status === "cancelled") {
              controller.abort();
              return;
            }
          } catch {
            // ligne SSE non-JSON (ex: commentaire keep-alive)
          }
        }
      }
    } catch (err) {
      if ((err as { name?: string }).name !== "AbortError") console.error("SSE error", err);
    }
  })();

  return () => controller.abort();
}

// ─── DELETE /jobs/{job_id} ───────────────────────────────────────────────────

export async function cancelRender(jobId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error("Cancel failed"), {
      status: res.status,
      detail: err,
    });
  }
}

// ─── GET /jobs/{job_id}/download ─────────────────────────────────────────────

async function fetchVideoBlob(jobId: string): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}/download`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Video not available");
  return res.blob();
}

export async function getVideoObjectUrl(jobId: string): Promise<string> {
  const blob = await fetchVideoBlob(jobId);
  return URL.createObjectURL(blob);
}

export async function downloadVideo(jobId: string): Promise<void> {
  const blob = await fetchVideoBlob(jobId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${jobId}.mp4`;
  a.click();
  URL.revokeObjectURL(url);
}
