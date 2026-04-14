export default function MobileGuard() {
  return (
    <div className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-background px-8 text-center lg:hidden">
      <div className="mb-8 text-6xl">🔨</div>
      <h1 className="mb-3 text-3xl font-black tracking-tight">Vexia</h1>
      <p className="mb-2 text-lg font-semibold text-foreground">
        Le forgeron préfère les grands écrans.
      </p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Ce site est optimisé pour une utilisation sur ordinateur. Reviens depuis
        un PC ou un écran plus large pour profiter de toutes les
        fonctionnalités.
      </p>
      <div className="mt-10 flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        Disponible sur écran ≥ 1024px
      </div>
    </div>
  );
}
