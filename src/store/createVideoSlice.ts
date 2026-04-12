import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { templates } from "@/utils/constants/templates.constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClipStyle {
  border: number;
  color: string; // "0xRRGGBB"
  font: string;
  size: number;
}

export interface ClipTitleStyle {
  animation: string;
  border: number;
  color: string; // "0xRRGGBB"
  font: string;
  position: "left" | "center";
  size: number;
}

export interface GlobalTitleStyle {
  border: number;
  color: string; // "0xRRGGBB"
  font: string;
  size: number;
}

export interface GlobalTitleData {
  first: string;
  second: string;
  titleStyle: GlobalTitleStyle;
  subtitle: string;
  subtitleStyle: GlobalTitleStyle;
}

export interface ClipData {
  id: string;
  idStyle: ClipStyle;
  claude: boolean;
  title: string;
  url: string;
  start_time: string;
  duration: number;
  titleStyle: ClipTitleStyle;
  subtitle: string;
  subtitleStyle: ClipTitleStyle;
}

export interface SmoothTransitionConfig {
  active: boolean;
  duration: number;
}

export interface WatermarkConfig {
  active: boolean;
  text: string;
  color: string;
  font: string;
  size: number;
  opacity: number;
}

export interface HighlightActiveConfig {
  active: boolean;
  inactiveColor: string;
}

export interface ApplyTemplateDefaultsPayload {
  idStyle: ClipStyle;
  titleStyle: ClipTitleStyle;
  subtitleStyle: ClipTitleStyle;
  globalTitleStyle: GlobalTitleStyle;
  globalSubtitleStyle: GlobalTitleStyle;
  background: string;
  videoMargin: number;
  spacing: number;
  smoothTransition: SmoothTransitionConfig;
  watermark: Omit<WatermarkConfig, "text">;
  highlightActive: HighlightActiveConfig;
  teaserTop: boolean;
}

export interface CreateVideoState {
  templateValue: string;
  templateFeatures: string[];
  modeValue: string;
  saveStep1Checked: boolean;
  saveStep2Checked: boolean;
  teaserTop: boolean;
  globalTitle: GlobalTitleData;
  clips: ClipData[];
  background: string; // "video" | "0xRRGGBB"
  videoMargin: number;
  highlightPreviewActiveIndex: number | null;
  spacing: number;
  smoothTransition: SmoothTransitionConfig;
  watermark: WatermarkConfig;
  highlightActive: HighlightActiveConfig;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultIdStyle: ClipStyle = {
  border: 2,
  color: "0xFFFFFF",
  font: "dejavu",
  size: 50,
};

const defaultTitleStyle: ClipTitleStyle = {
  animation: "none",
  border: 2,
  color: "0xFFFFFF",
  font: "inter-semibold",
  position: "left",
  size: 45,
};

function makeClip(index: number): ClipData {
  return {
    id: `${index + 1}.`,
    idStyle: { ...defaultIdStyle },
    claude: false,
    title: "",
    url: "",
    start_time: "00:00:00",
    duration: 5,
    titleStyle: { ...defaultTitleStyle },
    subtitle: "",
    subtitleStyle: { ...defaultTitleStyle },
  };
}

const defaultGlobalTitle: GlobalTitleData = {
  first: "",
  second: "",
  titleStyle: { border: 3, color: "0xFFFFFF", font: "dejavu", size: 60 },
  subtitle: "",
  subtitleStyle: { border: 0, color: "0xC9C9C9", font: "dejavu", size: 36 },
};

const initialState: CreateVideoState = {
  templateValue: "top",
  templateFeatures: templates.find((t) => t.label === "top")?.features ?? [],
  modeValue: "default",
  saveStep1Checked: false,
  saveStep2Checked: false,
  teaserTop: false,
  globalTitle: { ...defaultGlobalTitle },
  clips: [makeClip(0)],
  background: "video",
  videoMargin: 0,
  spacing: 60,
  smoothTransition: { active: true, duration: 0.3 },
  watermark: {
    active: false,
    text: "",
    color: "0xC9C9C9",
    font: "inter",
    size: 36,
    opacity: 0.8,
  },
  highlightActive: { active: false, inactiveColor: "0x888888" },
  highlightPreviewActiveIndex: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const createVideoSlice = createSlice({
  name: "createVideo",
  initialState,
  reducers: {
    setTemplateValue(state, action: PayloadAction<string>) {
      state.templateValue = action.payload;
    },
    setTemplate(state, action: PayloadAction<string>) {
      const tpl = templates.find((t) => t.label === action.payload);
      if (!tpl) return;
      state.templateValue = tpl.label;
      state.templateFeatures = tpl.features;
      if (!tpl.features.includes("teaserTop")) {
        state.teaserTop = false;
        if (state.clips[0]?.title === "???") {
          state.clips[0].title = "";
        }
      }
    },
    setModeValue(state, action: PayloadAction<string>) {
      state.modeValue = action.payload;
    },
    setSaveStep1Checked(state, action: PayloadAction<boolean>) {
      state.saveStep1Checked = action.payload;
    },
    setSaveStep2Checked(state, action: PayloadAction<boolean>) {
      state.saveStep2Checked = action.payload;
    },
    applyTemplateDefaults(state, action: PayloadAction<ApplyTemplateDefaultsPayload>) {
      const d = action.payload;
      state.background = d.background;
      state.videoMargin = d.videoMargin;
      state.spacing = d.spacing;
      state.smoothTransition = d.smoothTransition;
      state.watermark = { ...state.watermark, ...d.watermark };
      state.highlightActive = d.highlightActive;
      state.teaserTop = d.teaserTop;
      state.globalTitle = {
        ...state.globalTitle,
        titleStyle: d.globalTitleStyle,
        subtitleStyle: d.globalSubtitleStyle,
      };
      state.clips = state.clips.map((clip) => ({
        ...clip,
        idStyle: { ...d.idStyle },
        titleStyle: { ...d.titleStyle },
        subtitleStyle: { ...d.subtitleStyle },
      }));
    },
    setTeaserTop(state, action: PayloadAction<boolean>) {
      state.teaserTop = action.payload;
    },
    updateGlobalTitle(state, action: PayloadAction<Partial<GlobalTitleData>>) {
      state.globalTitle = { ...state.globalTitle, ...action.payload };
    },
    addClip(state) {
      state.clips.push(makeClip(state.clips.length));
    },
    removeClip(state, action: PayloadAction<number>) {
      state.clips.splice(action.payload, 1);
    },
    updateClip(
      state,
      action: PayloadAction<{ index: number; data: Partial<ClipData> }>,
    ) {
      const { index, data } = action.payload;
      state.clips[index] = { ...state.clips[index], ...data };
    },
    setClips(state, action: PayloadAction<ClipData[]>) {
      state.clips = action.payload.map((clip, i) => ({
        ...clip,
        id: clip.id || `${i + 1}.`,
      }));
    },
    setBackground(state, action: PayloadAction<string>) {
      state.background = action.payload;
    },
    setVideoMargin(state, action: PayloadAction<number>) {
      state.videoMargin = action.payload;
    },
    setSpacing(state, action: PayloadAction<number>) {
      state.spacing = action.payload;
    },
    setSmoothTransition(
      state,
      action: PayloadAction<Partial<SmoothTransitionConfig>>,
    ) {
      state.smoothTransition = { ...state.smoothTransition, ...action.payload };
    },
    setWatermark(state, action: PayloadAction<Partial<WatermarkConfig>>) {
      state.watermark = { ...state.watermark, ...action.payload };
    },
    setHighlightActive(
      state,
      action: PayloadAction<Partial<HighlightActiveConfig>>,
    ) {
      state.highlightActive = { ...state.highlightActive, ...action.payload };
    },
    setHighlightPreviewActiveIndex(state, action: PayloadAction<number | null>) {
      state.highlightPreviewActiveIndex = action.payload;
    },
  },
});

export const {
  setTemplateValue,
  setTemplate,
  updateGlobalTitle,
  setModeValue,
  setSaveStep1Checked,
  setSaveStep2Checked,
  applyTemplateDefaults,
  setTeaserTop,
  addClip,
  removeClip,
  updateClip,
  setClips,
  setBackground,
  setVideoMargin,
  setSpacing,
  setSmoothTransition,
  setWatermark,
  setHighlightActive,
  setHighlightPreviewActiveIndex,
} = createVideoSlice.actions;

export default createVideoSlice.reducer;
