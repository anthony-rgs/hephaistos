import { fetchAuth } from "./http";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8001";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error("Login failed"), { status: res.status, detail: err });
  }

  return res.json();
}

// ─── Auth / Me ────────────────────────────────────────────────────────────────

export interface MeJob {
  job_id: string;
  title: string;
  status: string;
  created_at?: string;
  file_size_bytes?: number;
  duration_seconds?: number;
}

export interface MeResponse {
  id: string;
  username: string;
  is_admin: boolean;
  features: string[];
  max_jobs: number;
  total_videos_created: number;
  total_clips_used: number;
  total_duration_seconds: number;
  active_jobs: MeJob[];
  done_jobs: MeJob[];
}

export async function getMe(token?: string): Promise<MeResponse> {
  if (token) {
    const res = await fetch(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  }
  const res = await fetchAuth(`${BASE_URL}/auth/me`);
  return res.json();
}

type VerifyResult = "valid" | "invalid" | "error";

export async function verifyToken(token: string, signal?: AbortSignal): Promise<VerifyResult> {
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });
    return res.ok ? "valid" : "invalid";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "error";
    return "error";
  }
}
