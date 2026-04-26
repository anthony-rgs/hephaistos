import { MonitorIcon } from "lucide-react";

export default function MobileGuard() {
  return (
    <div className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-background px-8 text-center overflow-hidden lg:hidden">

      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-violet-600 blur-[120px] opacity-20" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-56 h-56 rounded-full bg-blue-600 blur-[100px] opacity-15" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-xs">

        {/* Icon */}
        <div className="size-16 rounded-2xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
          <MonitorIcon className="size-7 text-violet-400" />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
              Vexia Studio
            </span>
            <h1
              className="font-black uppercase tracking-tighter leading-[0.92]"
              style={{ fontSize: "clamp(2.2rem, 9vw, 3rem)" }}
            >
              Écran trop<br />
              <span className="text-violet-400">petit.</span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vexia Studio est conçu pour les grands écrans.
            Reviens depuis un ordinateur pour accéder à toutes les fonctionnalités.
          </p>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground">
          <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
          Disponible sur écran ≥ 1024px
        </div>

      </div>
    </div>
  );
}
