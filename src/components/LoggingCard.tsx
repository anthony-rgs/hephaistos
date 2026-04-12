import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/store";
import { loginSuccess } from "@/store/authSlice";
import { login } from "@/utils/api/auth";

export default function LoggingCard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Card className="w-full max-w-sm h-fit">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Entrez vos identifiants pour accéder à l'application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="login-form" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                placeholder="monnom"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        {error && (
          <p className="text-sm text-destructive w-full">{error}</p>
        )}
        <Button
          type="submit"
          form="login-form"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoaderIcon className="size-4 animate-spin" />
              Connexion…
            </>
          ) : (
            "Se connecter"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
