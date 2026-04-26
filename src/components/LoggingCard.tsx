import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderIcon, ArrowRightIcon, EyeIcon, EyeOffIcon, CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch } from "@/store";
import { loginSuccess } from "@/store/authSlice";
import { login } from "@/utils/api/auth";

const CONTACT_EMAIL = "ringressi.anthony@gmail.com";

export default function LoggingCard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { access_token } = await login(username, password);
      dispatch(loginSuccess({ token: access_token, username }));
      navigate("/create-video");
    } catch (err: unknown) {
      const detail = (err as { detail?: { detail?: string; message?: string } })?.detail;
      const msg = detail?.detail ?? detail?.message ?? "Identifiants incorrects.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-10 my-auto py-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
          Vexia Studio
        </span>
        <h1
          className="font-black uppercase tracking-tighter leading-none"
          style={{ fontSize: "clamp(2.8rem, 6vw, 3.5rem)" }}
        >
          Connexion
        </h1>
        <p className="text-sm text-muted-foreground">
          Entrez vos identifiants pour accéder à l'application.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="username"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Nom d'utilisateur
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="monnom"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            className="h-11"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Mot de passe
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword
                ? <EyeOffIcon className="size-4" />
                : <EyeIcon className="size-4" />
              }
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          size="lg"
          className="h-12 text-sm font-bold tracking-wide uppercase mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoaderIcon className="size-4 animate-spin" />
              Connexion…
            </>
          ) : (
            <>
              Se connecter
              <ArrowRightIcon className="size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Create account */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Créer un compte
          </span>
          <Separator className="flex-1" />
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            L'accès à Vexia Studio est sur invitation. Pour demander un compte,
            contacte-moi directement par mail.
          </p>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="group flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <span className="text-foreground">{CONTACT_EMAIL}</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {copied ? (
                <>
                  <CheckIcon className="size-3.5 text-green-500" />
                  <span className="text-green-500 font-semibold">Copié !</span>
                </>
              ) : (
                <>
                  <CopyIcon className="size-3.5" />
                  Copier
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
