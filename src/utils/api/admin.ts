import { fetchAuth } from "./http";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8001";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminJob {
  id: string;
  title: string;
  status: string;
  created_at: string;
  file_size_bytes?: number;
  duration_seconds?: number;
}

export interface AdminUser {
  id: string;
  username: string;
  is_admin: boolean;
  features: string[];
  max_jobs: number;
  created_at: string;
  jobs: AdminJob[];
  total_videos_created: number;
  total_clips_used: number;
  total_duration_seconds: number;
}

export interface CreateUserBody {
  username: string;
  password: string;
  is_admin: boolean;
  features: string[];
  max_jobs: number;
}

export interface PatchUserBody {
  password?: string;
  features?: string[];
  max_jobs?: number;
}

export interface SystemMetrics {
  cpu_percent: number;
  ram: { used_gb: number; total_gb: number; free_gb: number; percent: number };
  disk: { used_gb: number; total_gb: number; free_gb: number; percent: number };
  network: { bytes_sent: number; bytes_recv: number };
}

// ─── GET /admin/users ─────────────────────────────────────────────────────────

export async function getAdminUsers(): Promise<AdminUser[]> {
  const res = await fetchAuth(`${BASE_URL}/admin/users`);
  if (!res.ok) throw new Error("Forbidden");
  return res.json();
}

// ─── POST /admin/users ────────────────────────────────────────────────────────

export async function createAdminUser(body: CreateUserBody): Promise<AdminUser> {
  const res = await fetchAuth(`${BASE_URL}/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error("Create user failed"), { detail: err });
  }
  return res.json();
}

// ─── PATCH /admin/users/{id} ──────────────────────────────────────────────────

export async function patchAdminUser(id: string, body: PatchUserBody): Promise<void> {
  const res = await fetchAuth(`${BASE_URL}/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Patch user failed");
}

// ─── POST /admin/users/{id}/revoke ────────────────────────────────────────────

export async function revokeUserTokens(id: string): Promise<void> {
  const res = await fetchAuth(`${BASE_URL}/admin/users/${id}/revoke`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Revoke failed");
}

// ─── DELETE /admin/users/{id} ─────────────────────────────────────────────────

export async function deleteAdminUser(id: string): Promise<void> {
  const res = await fetchAuth(`${BASE_URL}/admin/users/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete user failed");
}

// ─── GET /admin/metrics/system ────────────────────────────────────────────────

export async function getSystemMetrics(): Promise<SystemMetrics> {
  const res = await fetchAuth(`${BASE_URL}/admin/metrics/system`);
  if (!res.ok) throw new Error("Failed to get metrics");
  return res.json();
}

// ─── PATCH /admin/metrics ─────────────────────────────────────────────────────

export async function patchAdminMetrics(body: { money_earned: number }): Promise<void> {
  const res = await fetchAuth(`${BASE_URL}/admin/metrics`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Patch metrics failed");
}
