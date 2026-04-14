import { NavLink, useNavigate } from "react-router-dom";
import { LogOutIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/authSlice";
import { useTheme } from "@/utils/useTheme";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);
  const { isDark, toggle } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/logging");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors px-3 py-1.5 rounded-md ${
      isActive
        ? "text-foreground bg-muted"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center px-6 lg:px-8 gap-8 bg-background/80 backdrop-blur-md border-b border-border">
      <NavLink
        to="/"
        className="font-bold text-base tracking-tight"
      >
        vexia.studio
      </NavLink>

      <nav className="flex items-center gap-1 ml-auto">
        <div className="hidden lg:flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={linkClass}
          >
            Accueil
          </NavLink>
          {token && (
            <>
              <NavLink
                to="/create-video"
                className={linkClass}
              >
                Créer une vidéo
              </NavLink>
              <NavLink
                to="/last-job"
                className={linkClass}
              >
                Dernier rendu
              </NavLink>
            </>
          )}
          {token ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOutIcon className="size-4" />
            </Button>
          ) : (
            <NavLink
              to="/logging"
              className={linkClass}
            >
              Connexion
            </NavLink>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="ml-2 text-muted-foreground hover:text-foreground"
          onClick={toggle}
        >
          {isDark ? (
            <SunIcon className="size-4" />
          ) : (
            <MoonIcon className="size-4" />
          )}
        </Button>
      </nav>
    </header>
  );
}
