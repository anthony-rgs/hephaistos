import type {
  ClipStyle,
  ClipTitleStyle,
  GlobalTitleStyle,
  SmoothTransitionConfig,
  WatermarkConfig,
  HighlightActiveConfig,
  ApplyTemplateDefaultsPayload,
} from "@/store/createVideoSlice";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SaveStep1Data {
  templateValue: string;
  modeValue: string;
}

export type SaveTemplateData = ApplyTemplateDefaultsPayload;

// ── Keys ──────────────────────────────────────────────────────────────────────

const KEY_STEP1 = "save_step1";
const templateKey = (tpl: string) => `save_template_${tpl}`;

// ── Step 1 ────────────────────────────────────────────────────────────────────

export function saveStep1(data: SaveStep1Data): void {
  localStorage.setItem(KEY_STEP1, JSON.stringify(data));
}

export function loadStep1(): SaveStep1Data | null {
  try {
    const raw = localStorage.getItem(KEY_STEP1);
    return raw ? (JSON.parse(raw) as SaveStep1Data) : null;
  } catch {
    return null;
  }
}

// ── Template config ───────────────────────────────────────────────────────────

export function saveTemplateConfig(tpl: string, data: SaveTemplateData): void {
  localStorage.setItem(templateKey(tpl), JSON.stringify(data));
}

export function loadTemplateConfig(tpl: string): SaveTemplateData | null {
  try {
    const raw = localStorage.getItem(templateKey(tpl));
    return raw ? (JSON.parse(raw) as SaveTemplateData) : null;
  } catch {
    return null;
  }
}

// ── Build SaveTemplateData from state ─────────────────────────────────────────

export function buildTemplateData(
  state: {
    clips: { idStyle: ClipStyle; titleStyle: ClipTitleStyle; subtitleStyle: ClipTitleStyle }[];
    globalTitle: { titleStyle: GlobalTitleStyle; subtitleStyle: GlobalTitleStyle };
    background: string;
    videoMargin: number;
    spacing: number;
    smoothTransition: SmoothTransitionConfig;
    watermark: WatermarkConfig;
    highlightActive: HighlightActiveConfig;
    teaserTop: boolean;
  }
): SaveTemplateData {
  const ref = state.clips[0];
  return {
    idStyle: { ...ref.idStyle },
    titleStyle: { ...ref.titleStyle },
    subtitleStyle: { ...ref.subtitleStyle },
    globalTitleStyle: { ...state.globalTitle.titleStyle },
    globalSubtitleStyle: { ...state.globalTitle.subtitleStyle },
    background: state.background,
    videoMargin: state.videoMargin,
    spacing: state.spacing,
    smoothTransition: { ...state.smoothTransition },
    watermark: {
      active: state.watermark.active,
      color: state.watermark.color,
      font: state.watermark.font,
      size: state.watermark.size,
      opacity: state.watermark.opacity,
    },
    highlightActive: { ...state.highlightActive },
    teaserTop: state.teaserTop,
  };
}
