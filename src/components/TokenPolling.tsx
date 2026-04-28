import { useEffect } from "react";
import { useAppSelector } from "@/store";
import { getMe } from "@/utils/api/auth";

export default function TokenPolling() {
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => {
      getMe().catch(() => {});
    }, 30_000);
    return () => clearInterval(id);
  }, [token]);

  return null;
}
