import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout, setUserData } from "@/store/authSlice";
import { verifyToken, getMe } from "@/utils/api/auth";

export default function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const [status, setStatus] = useState<"checking" | "valid" | "invalid">(
    token ? "checking" : "invalid"
  );

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const controller = new AbortController();

    verifyToken(token, controller.signal).then(async (result) => {
      if (controller.signal.aborted) return;
      if (result === "valid" || result === "error") {
        if (result === "valid") {
          getMe(token).then((me) => {
            if (!controller.signal.aborted) {
              dispatch(setUserData({ username: me.username, isAdmin: me.is_admin, features: me.features, maxJobs: me.max_jobs }));
            }
          }).catch(() => {});
        }
        setStatus("valid");
      } else {
        dispatch(logout());
        setStatus("invalid");
      }
    });

    return () => controller.abort();
  }, [token, dispatch]);

  if (status === "checking") return null;
  if (status === "invalid") return <Navigate to="/logging" replace />;

  return <Outlet />;
}
