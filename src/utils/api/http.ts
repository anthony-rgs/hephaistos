import { store } from "@/store";
import { logout } from "@/store/authSlice";
import { toast } from "sonner";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

let handling401 = false;

function handle401() {
  if (handling401) return;
  handling401 = true;
  store.dispatch(logout());
  toast.error("Session expirée. Veuillez vous reconnecter.", { id: "session-expired" });
  setTimeout(() => {
    window.location.href = "/logging";
    handling401 = false;
  }, 1500);
}

export async function fetchAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers as Record<string, string> ?? {}) },
  });

  if (res.status === 401) {
    handle401();
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }

  return res;
}
