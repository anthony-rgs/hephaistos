import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout, setUserData } from "@/store/authSlice";
import { verifyToken, getMe } from "@/utils/api/auth";

export default function AdminRoute() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const isAdmin = useAppSelector((s) => s.auth.isAdmin);
  const [status, setStatus] = useState<"checking" | "valid" | "forbidden" | "invalid">(
    token ? "checking" : "invalid"
  );

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }

    const controller = new AbortController();

    verifyToken(token, controller.signal).then(async (result) => {
      if (controller.signal.aborted) return;
      if (result === "invalid") { dispatch(logout()); setStatus("invalid"); return; }

      try {
        const me = await getMe(token);
        if (controller.signal.aborted) return;
        dispatch(setUserData({ username: me.username, isAdmin: me.is_admin, features: me.features, maxJobs: me.max_jobs }));
        setStatus(me.is_admin ? "valid" : "forbidden");
      } catch {
        setStatus(isAdmin ? "valid" : "forbidden");
      }
    });

    return () => controller.abort();
  }, [token, dispatch, isAdmin]);

  if (status === "checking") return null;
  if (status === "invalid") return <Navigate to="/logging" replace />;
  if (status === "forbidden") return <Navigate to="/" replace />;

  return <Outlet />;
}
