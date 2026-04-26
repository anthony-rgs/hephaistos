import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { LogOutIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/authSlice";
import { useTheme } from "@/utils/useTheme";

export default function Navbar({ showBanner = false, bannerIn = false }: { showBanner?: boolean; bannerIn?: boolean }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAppSelector((s) => s.auth.token);
  const { isDark, toggle } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/logging");
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-xs font-semibold uppercase tracking-widest transition-colors pb-0.5 ${
      isActive
        ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-violet-400"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className={`fixed left-0 right-0 h-14 z-40 flex items-center px-6 lg:px-10 bg-background/90 backdrop-blur-sm border-b border-border/50 transition-[top] duration-300 ease-out ${showBanner && bannerIn ? "top-10" : "top-0"}`}>

      {/* Logo */}
      <NavLink to="/" onClick={handleLogoClick} className="flex items-center gap-1.5 shrink-0">
        <span className="text-base font-black uppercase tracking-tight leading-none">
          Vexia
        </span>
        <span className="size-1.5 rounded-full bg-violet-400 mb-2 shrink-0" />
      </NavLink>

      {/* Nav links */}
      <nav className="hidden lg:flex items-center gap-7 ml-10">
        <NavLink to="/" end className={linkClass}>Accueil</NavLink>
        <NavLink to="/create-video" className={linkClass}>Créer</NavLink>
        {token && (
          <NavLink to="/last-job" className={linkClass}>Dernier rendu</NavLink>
        )}
        {!token && (
          <NavLink to="/logging" className={linkClass}>Connexion</NavLink>
        )}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-auto pl-6 border-l border-border/50">
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground size-8 p-0"
          onClick={toggle}
        >
          {isDark ? <SunIcon className="size-3.5" /> : <MoonIcon className="size-3.5" />}
        </Button>
        {token && (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground size-8 p-0"
            onClick={handleLogout}
          >
            <LogOutIcon className="size-3.5" />
          </Button>
        )}
      </div>

    </header>
  );
}
