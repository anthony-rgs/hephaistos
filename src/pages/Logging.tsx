import { LoggingCard } from "@/components";

export default function Logging() {
  return (
    <section className="relative flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-14 border-r border-border overflow-hidden relative">
        {/* Orb */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-125 h-125 rounded-full bg-violet-600 blur-[140px] opacity-20" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-72 h-72 rounded-full bg-blue-500 blur-[120px] opacity-15" />

        {/* Center headline */}
        <div className="relative z-10 flex flex-col gap-6 my-auto">
          <h2
            className="font-black uppercase tracking-tighter leading-[0.9]"
            style={{ fontSize: "clamp(3rem, 4.5vw, 5rem)" }}
          >
            <span className="text-foreground">Générez vos</span>
            <br />
            <span className="text-violet-400">vidéos courtes</span>
            <br />
            <span className="text-foreground">en quelques</span>
            <br />
            <span className="text-foreground">minutes.</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Choisis un template, colle tes liens YouTube, configure le style —
            le serveur assemble et te renvoie la vidéo prête à publier.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex items-center gap-8">
          {[
            { value: "4", label: "templates" },
            { value: "5 min", label: "de rendu" },
            { value: "100%", label: "personnalisable" },
            { value: "∞", label: "clips" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col gap-0.5"
            >
              <span className="text-2xl font-black tracking-tight uppercase leading-none">
                {value}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="relative flex flex-1 lg:max-w-120 flex-col items-center overflow-y-auto px-8 lg:px-16">
        {/* Orb mobile only */}
        <div className="pointer-events-none lg:hidden absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-violet-600 blur-[120px] opacity-20" />
        <LoggingCard />
      </div>
    </section>
  );
}
