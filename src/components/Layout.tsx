import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import MobileGuard from "./MobileGuard";
import TokenPolling from "./TokenPolling";
import { useAppSelector } from "@/store";
import { Button } from "./ui/button";

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);
  const showBanner = !token && pathname === "/create-video";

  const [bannerMounted, setBannerMounted] = useState(showBanner);
  const [bannerIn, setBannerIn] = useState(false);

  useEffect(() => {
    if (showBanner) {
      setBannerMounted(true);
      const t = setTimeout(() => setBannerIn(true), 30);
      return () => clearTimeout(t);
    } else {
      setBannerIn(false);
      const t = setTimeout(() => setBannerMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [showBanner]);

  return (
    <>
      {token && <TokenPolling />}
      {bannerMounted && (
        <div
          className={`fixed top-0 left-0 right-0 h-10 z-50 flex items-center justify-center gap-3 bg-violet-600/95 backdrop-blur-sm px-4 transition-transform duration-300 ease-out ${
            bannerIn ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <span className="text-xs font-medium text-white/90 hidden sm:inline">
            Tu veux créer une vidéo ? Connecte-toi pour accéder à toutes les fonctionnalités.
          </span>
          <span className="text-xs font-medium text-white/90 sm:hidden">
            Connecte-toi pour créer une vidéo.
          </span>
          <Button
            size="sm"
            variant="secondary"
            className="h-6 px-3 text-[11px] font-bold shrink-0"
            onClick={() => navigate("/logging")}
          >
            Se connecter
          </Button>
        </div>
      )}
      {pathname !== "/" && <MobileGuard />}
      <Navbar showBanner={showBanner} bannerIn={bannerIn} />
      <div
        className="transition-[padding-top] duration-300 ease-out"
        style={{ paddingTop: showBanner && bannerIn ? "6rem" : showBanner ? "3.5rem" : "3.5rem" }}
      >
        <Outlet />
      </div>
    </>
  );
}
