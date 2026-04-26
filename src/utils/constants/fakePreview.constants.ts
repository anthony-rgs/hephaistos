import type {
  ClipStyle,
  ClipTitleStyle,
  GlobalTitleData,
} from "@/store/createVideoSlice";
import previewMusic from "/images/preview.webp";
import previewFilm from "/images/preview-film.webp";
import previewNaruto from "/images/preview-naruto.webp";
import previewFoot from "/images/preview-foot.webp";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PreviewClip {
  id: string;
  idStyle: ClipStyle;
  title: string;
  titleStyle: ClipTitleStyle;
  subtitle: string;
  subtitleStyle: ClipTitleStyle;
}

export interface FakePreviewData {
  bgSrc: string;
  clips: PreviewClip[];
  globalTitle?: GlobalTitleData;
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const ID: ClipStyle = {
  border: 2,
  color: "0xFFFFFF",
  font: "dejavu",
  size: 50,
};

const TITLE_LEFT: ClipTitleStyle = {
  animation: "none",
  border: 2,
  color: "0xFFFFFF",
  font: "inter-semibold",
  position: "left",
  size: 45,
};
const TITLE_CENTER: ClipTitleStyle = {
  animation: "none",
  border: 2,
  color: "0xFFFFFF",
  font: "inter-semibold",
  position: "center",
  size: 60,
};
const SUB_LEFT: ClipTitleStyle = {
  animation: "none",
  border: 1,
  color: "0xC9C9C9",
  font: "inter",
  position: "left",
  size: 36,
};
const SUB_CENTER: ClipTitleStyle = {
  animation: "none",
  border: 1,
  color: "0xC9C9C9",
  font: "inter",
  position: "center",
  size: 40,
};

// ── Fake data per template ────────────────────────────────────────────────────

export const FAKE_PREVIEW: Record<string, FakePreviewData> = {
  top: {
    bgSrc: previewMusic,
    globalTitle: {
      first: "TOP 5 The Weeknd's",
      second: "Most Streamed Songs",
      titleStyle: { border: 2, color: "0xFFFFFF", font: "dejavu", size: 60 },
      subtitle: "(on Spotify)",
      subtitleStyle: { border: 0, color: "0xC9C9C9", font: "dejavu", size: 36 },
    },
    clips: [
      {
        id: "1.",
        idStyle: ID,
        title: "Blinding Lights (4.20b)",
        titleStyle: TITLE_LEFT,
        subtitle: "",
        subtitleStyle: SUB_LEFT,
      },
      {
        id: "2.",
        idStyle: ID,
        title: "Starboy (3.10b)",
        titleStyle: TITLE_LEFT,
        subtitle: "",
        subtitleStyle: SUB_LEFT,
      },
      {
        id: "3.",
        idStyle: ID,
        title: "Save Your Tears (2.87b)",
        titleStyle: TITLE_LEFT,
        subtitle: "",
        subtitleStyle: SUB_LEFT,
      },
      {
        id: "4.",
        idStyle: ID,
        title: "Die For You (2.45b)",
        titleStyle: TITLE_LEFT,
        subtitle: "",
        subtitleStyle: SUB_LEFT,
      },
      {
        id: "5.",
        idStyle: ID,
        title: "The Hills (2.12b)",
        titleStyle: TITLE_LEFT,
        subtitle: "",
        subtitleStyle: SUB_LEFT,
      },
    ],
  },
  classic: {
    bgSrc: previewFilm,
    globalTitle: {
      first: "Les meilleures scènes",
      second: "de Avengers Infinity War",
      titleStyle: { border: 2, color: "0xFFFFFF", font: "dejavu", size: 60 },
      subtitle: "(partie 1)",
      subtitleStyle: { border: 0, color: "0xC9C9C9", font: "dejavu", size: 36 },
    },
    clips: [
      {
        id: "1.",
        idStyle: ID,
        title: "L'entrée de Iron Man 🔥",
        titleStyle: TITLE_CENTER,
        subtitle: "Iron man vs Ebony Maw",
        subtitleStyle: SUB_CENTER,
      },
    ],
  },
  minimal: {
    bgSrc: previewNaruto,
    clips: [
      {
        id: "1.",
        idStyle: ID,
        title: "Naruto vs Sasuke",
        titleStyle: { ...TITLE_CENTER, size: 64 },
        subtitle: "Épisode 476",
        subtitleStyle: SUB_CENTER,
      },
    ],
  },
  expanded: {
    bgSrc: previewFoot,
    clips: [
      {
        id: "1.",
        idStyle: ID,
        title: "Benjamin Pavard ☄️",
        titleStyle: { ...TITLE_CENTER, size: 70 },
        subtitle: "France - Argentine",
        subtitleStyle: SUB_CENTER,
      },
    ],
  },
};
