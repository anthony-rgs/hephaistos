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

// Retourne true si le token est valide, false sinon (expiré, invalide, réseau KO)
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
    // Erreur réseau ou autre — on ne déco pas l'utilisateur
    return "error";
  }
}
