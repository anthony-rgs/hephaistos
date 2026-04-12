import { useRef, useEffect, useState, type CSSProperties } from "react";
import { useAppSelector } from "@/store";
import type { ClipData, GlobalTitleData } from "@/store/createVideoSlice";
import { FAKE_PREVIEW, type PreviewClip } from "@/utils/constants/fakePreview.constants";

// ── Constants ─────────────────────────────────────────────────────────────────

const W = 1080;
const H = 1920;
const RANK_X = 60;
const CLIP_TITLE_X = 180;

// ── Helpers ───────────────────────────────────────────────────────────────────

function toPreviewClip(c: ClipData): PreviewClip {
  return {
    id: c.id,
    idStyle: c.idStyle,
    title: c.title,
    titleStyle: c.titleStyle,
    subtitle: c.subtitle,
    subtitleStyle: c.subtitleStyle,
  };
}

// ── Style helpers ─────────────────────────────────────────────────────────────

function hex(c: string): string {
  if (c.startsWith("0x")) return "#" + c.slice(2);
  return c.startsWith("#") ? c : "#ffffff";
}

type AnyStyle =
  | ClipData["idStyle"]
  | ClipData["titleStyle"]
  | GlobalTitleData["titleStyle"];

function ts(s: AnyStyle, align?: "left" | "center", scale = 1): CSSProperties {
  const base: CSSProperties = {
    color: hex(s.color),
    fontSize: s.size,
    fontFamily: `"${s.font}", sans-serif`,
    lineHeight: 1,
    whiteSpace: "nowrap",
    // Désactive le font-smoothing pour coller au rendu FFmpeg/FreeType
    WebkitFontSmoothing: "none",
  };
  if (s.border > 0) {
    // Compense le CSS scale pour que le border visuel soit fidèle à la vidéo réelle
    base.WebkitTextStroke = `${s.border / scale}px #000`;
    base.paintOrder = "stroke fill";
  }
  if (align) base.textAlign = align;
  return base;
}

function pos(x: number, y: number, extra?: CSSProperties): CSSProperties {
  return { position: "absolute", left: x, top: y, ...extra };
}

// Wrapper centré : flex > justifyContent center, sans textAlign (plus fiable)
function posCenter(y: number): CSSProperties {
  return {
    position: "absolute",
    left: 0,
    top: y,
    width: W,
    display: "flex",
    justifyContent: "center",
  };
}

function animStyle(animation: string): CSSProperties {
  if (!animation || animation === "none") return {};
  switch (animation) {
    case "fade":
      return { animation: "preview-fade 0.3s ease-out forwards" };
    case "slide-left":
      return { animation: "preview-slide-left 0.3s ease-out forwards" };
    case "slide-bottom":
      return { animation: "preview-slide-bottom 0.3s ease-out forwards" };
    case "typewriter":
      return { animation: "preview-typewriter 1.2s steps(30, end) forwards" };
    default:
      return {};
  }
}

// ── Sub-renderers ─────────────────────────────────────────────────────────────

function GlobalHeader({ g, scale }: { g: GlobalTitleData; scale: number }) {
  return (
    <>
      {g.first && (
        <div style={{ ...posCenter(120), ...ts(g.titleStyle, "center", scale) }}>
          {g.first}
        </div>
      )}
      {g.second && (
        <div style={{ ...posCenter(210), ...ts(g.titleStyle, "center", scale) }}>
          {g.second}
        </div>
      )}
      {g.subtitle && (
        <div style={{ ...posCenter(290), ...ts(g.subtitleStyle, "center", scale) }}>
          {g.subtitle}
        </div>
      )}
    </>
  );
}

function headerBottom(g: GlobalTitleData): number {
  if (g.subtitle) return 290 + g.subtitleStyle.size + 30;
  if (g.second) return 210 + g.titleStyle.size + 30;
  if (g.first) return 120 + g.titleStyle.size + 30;
  return 60;
}

type KeyFor = (obj: object) => number;

function TopClipsList({
  clips,
  globalTitle,
  videoY,
  keyFor,
  highlightActiveIndex,
  inactiveColor,
  scale,
}: {
  clips: PreviewClip[];
  globalTitle: GlobalTitleData;
  videoY: number;
  keyFor: KeyFor;
  highlightActiveIndex: number | null;
  inactiveColor: string;
  scale: number;
}) {
  const hdrBottom = headerBottom(globalTitle);
  const visible = clips.slice(0, 5);
  const itemH = Math.max(
    70,
    (videoY - hdrBottom - 20) / Math.max(visible.length, 1),
  );

  return (
    <>
      {visible.map((clip, i) => {
        const itemY =
          hdrBottom + 20 + i * itemH + itemH / 2 - clip.idStyle.size * 0.6;
        const titleCentered = clip.titleStyle.position === "center";

        const isHighlighting = highlightActiveIndex !== null;
        const isActive = highlightActiveIndex === i;
        const overrideColor = isHighlighting && !isActive ? hex(inactiveColor) : undefined;
        const overrideOpacity = isHighlighting && !isActive ? 0.6 : undefined;

        const titleStyle: CSSProperties = {
          ...ts(clip.titleStyle, undefined, scale),
          ...animStyle(clip.titleStyle.animation),
          ...(overrideColor && { color: overrideColor }),
          ...(overrideOpacity !== undefined && { opacity: overrideOpacity }),
        };
        const idStyle: CSSProperties = {
          ...ts(clip.idStyle, undefined, scale),
          ...(overrideColor && { color: overrideColor }),
          ...(overrideOpacity !== undefined && { opacity: overrideOpacity }),
        };

        return (
          <div key={i}>
            {clip.id && (
              <span style={pos(RANK_X, itemY, idStyle)}>
                {clip.id}
              </span>
            )}
            {clip.title &&
              (titleCentered ? (
                <div style={posCenter(itemY)}>
                  <span key={keyFor(clip.titleStyle)} style={titleStyle}>
                    {clip.title}
                  </span>
                </div>
              ) : (
                <span
                  key={keyFor(clip.titleStyle)}
                  style={pos(clip.id ? CLIP_TITLE_X : RANK_X, itemY, {
                    ...titleStyle,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: W - 150,
                  })}
                >
                  {clip.title}
                </span>
              ))}
          </div>
        );
      })}
    </>
  );
}

function ClipAboveVideo({
  clip,
  videoY,
  spacing,
  keyFor,
  scale,
}: {
  clip: PreviewClip;
  videoY: number;
  spacing: number;
  keyFor: KeyFor;
  scale: number;
}) {
  const centered = clip.titleStyle.position === "center";

  const titleEl = (y: number, style: PreviewClip["titleStyle"]) => {
    const inner = (
      <span
        key={keyFor(style)}
        style={{ ...ts(style, undefined, scale), ...animStyle(style.animation) }}
      >
        {clip.title}
      </span>
    );
    return centered ? (
      <div style={posCenter(y)}>{inner}</div>
    ) : (
      <div style={pos(RANK_X, y, { maxWidth: W - 100, overflow: "hidden" })}>
        {inner}
      </div>
    );
  };

  const subEl = (y: number, style: PreviewClip["subtitleStyle"]) => {
    const inner = (
      <span
        key={keyFor(style)}
        style={{ ...ts(style, undefined, scale), ...animStyle(style.animation) }}
      >
        {clip.subtitle}
      </span>
    );
    return style.position === "center" ? (
      <div style={posCenter(y)}>{inner}</div>
    ) : (
      <div style={pos(RANK_X, y, { maxWidth: W - 100, overflow: "hidden" })}>
        {inner}
      </div>
    );
  };

  if (clip.subtitle) {
    const subY = videoY - spacing - clip.subtitleStyle.size;
    const titleY = subY - spacing - clip.titleStyle.size;
    return (
      <>
        {clip.title && titleEl(titleY, clip.titleStyle)}
        {subEl(subY, clip.subtitleStyle)}
      </>
    );
  }

  const titleY = videoY - spacing - clip.titleStyle.size;
  return clip.title ? titleEl(titleY, clip.titleStyle) : null;
}

function ExpandedHeader({
  clip,
  spacing,
  keyFor,
  scale,
}: {
  clip: PreviewClip | undefined;
  spacing: number;
  keyFor: KeyFor;
  scale: number;
}) {
  if (!clip?.title) return null;
  const blockH =
    clip.titleStyle.size +
    (clip.subtitle ? spacing + clip.subtitleStyle.size : 0);
  const topOffset = Math.max(0, (250 - blockH) / 2);

  const titleCentered = clip.titleStyle.position === "center";
  const subCentered = clip.subtitleStyle?.position === "center";

  return (
    <>
      {titleCentered ? (
        <div style={posCenter(topOffset)}>
          <span key={keyFor(clip.titleStyle)} style={{ ...ts(clip.titleStyle, undefined, scale), ...animStyle(clip.titleStyle.animation) }}>
            {clip.title}
          </span>
        </div>
      ) : (
        <div style={pos(RANK_X, topOffset, { maxWidth: W - 100, overflow: "hidden" })}>
          <span key={keyFor(clip.titleStyle)} style={{ ...ts(clip.titleStyle, undefined, scale), ...animStyle(clip.titleStyle.animation) }}>
            {clip.title}
          </span>
        </div>
      )}
      {clip.subtitle && (
        subCentered ? (
          <div style={posCenter(topOffset + clip.titleStyle.size + spacing)}>
            <span key={keyFor(clip.subtitleStyle)} style={{ ...ts(clip.subtitleStyle, undefined, scale), ...animStyle(clip.subtitleStyle.animation) }}>
              {clip.subtitle}
            </span>
          </div>
        ) : (
          <div style={pos(RANK_X, topOffset + clip.titleStyle.size + spacing, { maxWidth: W - 100, overflow: "hidden" })}>
            <span key={keyFor(clip.subtitleStyle)} style={{ ...ts(clip.subtitleStyle, undefined, scale), ...animStyle(clip.subtitleStyle.animation) }}>
              {clip.subtitle}
            </span>
          </div>
        )
      )}
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface FakeOverride {
  clips?: PreviewClip[];
  globalTitle?: GlobalTitleData;
  bgSrc?: string; // URL d'image/gif custom pour le fond et le foreground
  background?: string; // "video" | "0xRRGGBB"
}

export default function TemplatePreview({
  mode = "fake",
  templateOverride,
  fakeOverride,
}: {
  mode?: "fake" | "live" | "image";
  templateOverride?: string;
  fakeOverride?: FakeOverride;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const {
    templateValue: storeTemplateValue,
    globalTitle,
    clips,
    background,
    videoMargin,
    spacing: storeSpacing,
    watermark,
    highlightActive,
    highlightPreviewActiveIndex,
  } = useAppSelector((s) => s.createVideo);

  const templateValue = templateOverride ?? storeTemplateValue;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => setScale(el.clientHeight / H);
    compute();
    const obs = new ResizeObserver(compute);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  let videoY: number, videoH: number, defaultSpacing: number;
  switch (templateValue) {
    case "classic":
      videoY = 780;
      videoH = 700;
      defaultSpacing = 60;
      break;
    case "minimal":
      videoY = 610;
      videoH = 700;
      defaultSpacing = 60;
      break;
    case "expanded":
      videoY = 250;
      videoH = 1420;
      defaultSpacing = 20;
      break;
    default:
      videoY = 960;
      videoH = 700;
      defaultSpacing = 60; // top
  }

  const clipSpacing = mode === "fake" ? defaultSpacing : storeSpacing;

  const fakeData = FAKE_PREVIEW[templateValue] ?? FAKE_PREVIEW.top;

  const activeBgSrc = fakeOverride?.bgSrc ?? fakeData.bgSrc;
  const activeBg = mode === "fake" ? (fakeOverride?.background ?? "video") : background;
  // En mode fake, on ignore les réglages du store pour un rendu totalement indépendant
  const activeVideoMargin = mode === "fake" ? 0 : videoMargin;

  const activeGlobalTitle =
    mode === "fake" ? (fakeOverride?.globalTitle ?? fakeData.globalTitle) : globalTitle;
  const activeClips: PreviewClip[] =
    mode === "fake"
      ? (fakeOverride?.clips ?? fakeData.clips)
      : clips.map(toPreviewClip);
  const firstClip = activeClips[0];

  // WeakMap : chaque nouvel objet style reçoit un ID unique → les spans animés se remontent individuellement
  const styleIds = useRef(new WeakMap<object, number>());
  const nextId = useRef(0);
  const styleId = (obj: object) => {
    if (!styleIds.current.has(obj)) styleIds.current.set(obj, nextId.current++);
    return styleIds.current.get(obj)!;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: W,
          height: H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          overflow: "hidden",
        }}
      >
        {/* Fond */}
        {activeBg === "video" ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#0d0d0d",
              overflow: "hidden",
            }}
          >
            <img
              src={activeBgSrc}
              style={{
                position: "absolute",
                top: -80,
                left: 0,
                width: W + 160,
                height: H + 160,
                objectFit: "cover",
                filter: "blur(20px) brightness(0.5)",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: hex(activeBg),
            }}
          />
        )}

        {/* Vidéo foreground */}
        <img
          src={activeBgSrc}
          style={{
            position: "absolute",
            left: activeVideoMargin,
            top: videoY,
            width: W - 2 * activeVideoMargin,
            height: videoH,
            objectFit: "cover",
          }}
        />

        {/* Overlay textes */}
        {mode !== "image" && (
          <>
            {(templateValue === "top" || templateValue === "classic") && activeGlobalTitle && (
              <GlobalHeader g={activeGlobalTitle} scale={scale} />
            )}
            {templateValue === "top" && activeGlobalTitle && (
              <TopClipsList
                clips={activeClips}
                globalTitle={activeGlobalTitle}
                videoY={videoY}
                keyFor={styleId}
                highlightActiveIndex={highlightPreviewActiveIndex}
                inactiveColor={highlightActive.inactiveColor}
                scale={scale}
              />
            )}
            {(templateValue === "classic" || templateValue === "minimal") &&
              firstClip && (
                <ClipAboveVideo
                  clip={firstClip}
                  videoY={videoY}
                  spacing={clipSpacing}
                  keyFor={styleId}
                  scale={scale}
                />
              )}
            {templateValue === "expanded" && (
              <ExpandedHeader
                clip={firstClip}
                spacing={clipSpacing}
                keyFor={styleId}
                scale={scale}
              />
            )}
            {watermark.active && watermark.text && (
              <div
                style={{
                  position: "absolute",
                  left: activeVideoMargin + 30,
                  top: videoY + videoH - watermark.size - 20,
                  color: hex(watermark.color),
                  fontSize: watermark.size,
                  fontFamily: `"${watermark.font}", sans-serif`,
                  opacity: watermark.opacity,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {watermark.text}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
