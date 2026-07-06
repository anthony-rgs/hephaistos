import { useAppSelector } from "@/store";
import type { ClipData, GlobalTitleData } from "@/store/createVideoSlice";
import SectionHeader from "./SectionHeader";

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexColor(c: string): string {
  if (c.startsWith("0x")) return "#" + c.slice(2);
  return c.startsWith("#") ? c : "#ffffff";
}

function extractYtId(url: string): string | null {
  try { return new URL(url).searchParams.get("v"); } catch { return null; }
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-2 rounded-full border border-black/20 shrink-0"
      style={{ background: hexColor(color) }}
    />
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground leading-none">
      {label}
    </span>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="pt-3 pb-1 text-[10px] font-bold tracking-[0.15em] text-violet-400 uppercase">
      {children}
    </p>
  );
}

// ── Style tag row: prefix + color dot + tags ──────────────────────────────────

function StyleTagRow({
  prefix,
  color,
  font,
  size,
  border,
  animation,
  position,
}: {
  prefix: string;
  color: string;
  font: string;
  size: number;
  border?: number;
  animation?: string;
  position?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="w-4 text-[9px] font-bold tracking-wide text-muted-foreground/50 uppercase shrink-0">
        {prefix}
      </span>
      <ColorDot color={color} />
      <Tag label={font} />
      <Tag label={`${size}px`} />
      {border != null && border > 0 && <Tag label={`bord. ${border}`} />}
      {animation && animation !== "none" && <Tag label={animation} />}
      {position === "center" && <Tag label="centré" />}
    </div>
  );
}

// ── Global title row ──────────────────────────────────────────────────────────

function GlobalTitleRow({ g }: { g: GlobalTitleData }) {
  const lines = [g.first, g.second].filter(Boolean);
  const hasSubtitle = !!g.subtitle;

  return (
    <div className="flex flex-col gap-1.5 py-3 border-b border-border/50">
      <div className="flex-1 min-w-0">
        {lines.length > 0
          ? lines.map((l, i) => <p key={i} className="text-sm font-medium leading-tight truncate">{l}</p>)
          : <p className="text-sm text-muted-foreground italic">—</p>}
        {hasSubtitle && (
          <p className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">{g.subtitle}</p>
        )}
      </div>
      <div className="flex flex-col gap-1 mt-0.5">
        <StyleTagRow prefix="T" color={g.titleStyle.color} font={g.titleStyle.font} size={g.titleStyle.size} border={g.titleStyle.border} />
        {hasSubtitle && (
          <StyleTagRow prefix="S" color={g.subtitleStyle.color} font={g.subtitleStyle.font} size={g.subtitleStyle.size} border={g.subtitleStyle.border} />
        )}
      </div>
    </div>
  );
}

// ── Clip row ──────────────────────────────────────────────────────────────────

function ClipRow({ clip }: { clip: ClipData }) {
  const ytId = extractYtId(clip.url);
  const hasSubtitle = !!clip.subtitle;
  const hasId = !!clip.id;

  return (
    <div className="flex flex-col gap-1.5 py-3 border-b border-border/50 last:border-0">
      <div className="flex items-start gap-2">
        {hasId && (
          <span className="shrink-0 text-[11px] font-mono text-violet-400 mt-px w-5 leading-tight">
            {clip.id}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-tight truncate ${!clip.title ? "text-muted-foreground italic" : ""}`}>
            {clip.title || "sans titre"}
          </p>
          {hasSubtitle && (
            <p className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">{clip.subtitle}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          {ytId
            ? <span className="text-[10px] font-mono text-muted-foreground max-w-28 truncate">/{ytId}</span>
            : <span className="text-[10px] text-muted-foreground italic">pas de vidéo</span>}
          {clip.start_time && clip.start_time !== "00:00:00" && (
            <span className="text-[10px] font-mono text-muted-foreground">{clip.start_time}</span>
          )}
          <span className="text-[10px] font-mono text-muted-foreground">{clip.duration}s</span>
        </div>
      </div>
      <div className={`flex flex-col gap-1 ${hasId ? "pl-5" : ""}`}>
        {hasId && <StyleTagRow prefix="id" color={clip.idStyle.color} font={clip.idStyle.font} size={clip.idStyle.size} border={clip.idStyle.border} />}
        <StyleTagRow prefix="T" color={clip.titleStyle.color} font={clip.titleStyle.font} size={clip.titleStyle.size} border={clip.titleStyle.border} animation={clip.titleStyle.animation} position={clip.titleStyle.position} />
        {hasSubtitle && (
          <StyleTagRow prefix="S" color={clip.subtitleStyle.color} font={clip.subtitleStyle.font} size={clip.subtitleStyle.size} border={clip.subtitleStyle.border} animation={clip.subtitleStyle.animation} position={clip.subtitleStyle.position} />
        )}
      </div>
    </div>
  );
}

// ── Render param row ──────────────────────────────────────────────────────────

function ParamRow({ label, value, dot }: { label: string; value: string; dot?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <span className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-wide shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {dot && <ColorDot color={dot} />}
        <span className="text-[10px] font-mono text-muted-foreground">{value}</span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ClipsSummary() {
  const {
    clips, globalTitle, templateFeatures,
    background, videoMargin, spacing, smoothTransition, watermark, highlightActive,
  } = useAppSelector((s) => s.createVideo);

  const hasGlobalTitle = templateFeatures.includes("globalTitle");
  const showGlobalTitle = hasGlobalTitle && (!!globalTitle.first || !!globalTitle.second || !!globalTitle.subtitle);

  const bgLabel =
    background === "video" ? "vidéo"
    : background === "0xFFFFFF" ? "blanc"
    : background === "0x000000" ? "noir"
    : hexColor(background);

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader eyebrow="Récap" title="Résumé" />

      <div className="rounded-lg border border-border bg-card/50 px-4 pb-1">
        {showGlobalTitle && (
          <>
            <CardLabel>Titre global</CardLabel>
            <GlobalTitleRow g={globalTitle} />
          </>
        )}

        <CardLabel>Extraits · {clips.length}</CardLabel>
        {clips.map((clip, i) => <ClipRow key={i} clip={clip} />)}

        <CardLabel>Rendu</CardLabel>
        <ParamRow label="Fond" value={bgLabel} dot={background !== "video" ? background : undefined} />
        {videoMargin !== 0 && <ParamRow label="Marge vidéo" value={`${videoMargin}px`} />}
        <ParamRow label="Espacement" value={`${spacing}px`} />
        <ParamRow label="Transition" value={smoothTransition.active ? `${smoothTransition.duration}s` : "désactivée"} />
        {watermark.active && watermark.text && <ParamRow label="Watermark" value={watermark.text} dot={watermark.color} />}
        {highlightActive.active && <ParamRow label="Highlight" value="actif" dot={highlightActive.inactiveColor} />}
      </div>
    </div>
  );
}
