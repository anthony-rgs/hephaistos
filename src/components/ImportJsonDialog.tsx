import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { XIcon } from "lucide-react";
import { useAppDispatch } from "@/store";
import { setClips, updateGlobalTitle } from "@/store/createVideoSlice";
import type { ClipData, GlobalTitleData } from "@/store/createVideoSlice";

// ─── Types ────────────────────────────────────────────────────────────────────

interface JsonClip {
  id?: string;
  idStyle?: Partial<ClipData["idStyle"]>;
  title?: string;
  titleStyle?: Partial<ClipData["titleStyle"]>;
  subtitle?: string;
  subtitleStyle?: Partial<ClipData["subtitleStyle"]>;
  url?: string;
  start_time?: string;
  duration?: number;
  claude?: boolean;
}

interface JsonGlobalTitle {
  first?: string;
  second?: string;
  subtitle?: string;
  titleStyle?: Partial<GlobalTitleData["titleStyle"]>;
  subtitleStyle?: Partial<GlobalTitleData["subtitleStyle"]>;
}

interface Parsed {
  globalTitle: JsonGlobalTitle | null;
  clips: JsonClip[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_ID_STYLE: ClipData["idStyle"] = {
  border: 2,
  color: "0xFFFFFF",
  font: "dejavu",
  size: 50,
};
const DEFAULT_TITLE_STYLE: ClipData["titleStyle"] = {
  animation: "none",
  border: 2,
  color: "0xFFFFFF",
  font: "inter-semibold",
  position: "left",
  size: 45,
};
const DEFAULT_GLOBAL_TITLE_STYLE: GlobalTitleData["titleStyle"] = {
  border: 2,
  color: "0xFFFFFF",
  font: "dejavu",
  size: 60,
};
const DEFAULT_GLOBAL_SUB_STYLE: GlobalTitleData["subtitleStyle"] = {
  border: 0,
  color: "0xC9C9C9",
  font: "dejavu",
  size: 36,
};

function toClipData(raw: JsonClip, index: number): ClipData {
  return {
    id: raw.id ?? `${index + 1}.`,
    idStyle: { ...DEFAULT_ID_STYLE, ...raw.idStyle },
    claude: raw.claude ?? false,
    title: raw.title ?? "",
    url: raw.url ?? "",
    start_time: raw.start_time ?? "00:00:00",
    duration: raw.duration ?? 5,
    titleStyle: { ...DEFAULT_TITLE_STYLE, ...raw.titleStyle },
    subtitle: raw.subtitle ?? "",
    subtitleStyle: { ...DEFAULT_TITLE_STYLE, ...raw.subtitleStyle },
  };
}

function toGlobalTitle(raw: JsonGlobalTitle): Partial<GlobalTitleData> {
  return {
    first: raw.first ?? "",
    second: raw.second ?? "",
    subtitle: raw.subtitle ?? "",
    titleStyle: { ...DEFAULT_GLOBAL_TITLE_STYLE, ...raw.titleStyle },
    subtitleStyle: { ...DEFAULT_GLOBAL_SUB_STYLE, ...raw.subtitleStyle },
  };
}

function parse(
  value: string,
): { result: Parsed; error: null } | { result: null; error: string } {
  try {
    const val = JSON.parse(value);
    if (Array.isArray(val)) {
      return {
        result: { globalTitle: null, clips: val as JsonClip[] },
        error: null,
      };
    }
    if (val && typeof val === "object" && Array.isArray(val.data)) {
      return {
        result: {
          globalTitle: val.title ?? null,
          clips: val.data as JsonClip[],
        },
        error: null,
      };
    }
    return {
      result: null,
      error:
        "Format invalide. Attendu : un tableau [ … ] ou { title: {…}, data: [ … ] }",
    };
  } catch (e) {
    return { result: null, error: (e as Error).message };
  }
}

// ─── Placeholder ──────────────────────────────────────────────────────────────

const PLACEHOLDER = `[
  {
    "id": "1.",
    "title": "Blinding Lights (4.20b)",
    "subtitle": "4 223 804 521 streams",
    "url": "https://www.youtube.com/watch?v=...",
    "start_time": "00:00:45",
    "duration": 7
  }, ...
]

ou

{
  "title": {
    "first": "TOP 5 The Weeknd's",
    "second": "Most Streamed Songs",
    "subtitle": "(on Spotify)"
  },
  "data": [
    {
      "id": "1.",
      "title": "Blinding Lights (4.20b)",
      "subtitle": "4 223 804 521 streams",
      "url": "https://www.youtube.com/watch?v=...",
      "start_time": "00:00:45",
      "duration": 7
    }, ...
  ]
}
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImportJsonDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);

  const handleChange = (value: string) => {
    setRaw(value);
    if (!value.trim()) {
      setParsed(null);
      setError(null);
      return;
    }
    const { result, error } = parse(value);
    setParsed(result);
    setError(error);
  };

  const handleConfirm = () => {
    if (!parsed) return;
    if (parsed.globalTitle)
      dispatch(updateGlobalTitle(toGlobalTitle(parsed.globalTitle)));
    dispatch(setClips(parsed.clips.map(toClipData)));
    onOpenChange(false);
    setRaw("");
    setParsed(null);
    setError(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setRaw("");
    setParsed(null);
    setError(null);
  };

  const g = parsed?.globalTitle;
  const clips = parsed?.clips ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-[80dvw] p-0 gap-0 overflow-hidden">
        <div className="flex items-center px-6 py-4 border-b shrink-0">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="w-4 h-px bg-violet-400" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                Import
              </span>
            </div>
            <h2 className="text-base font-semibold tracking-tight leading-none">
              Importer un JSON
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] h-[65vh] min-h-0">
          {/* Colonne gauche — textarea */}
          <div className="flex flex-col gap-3 p-4 min-h-0">
            <p className="text-xs text-muted-foreground">
              Tableau seul <code className="font-mono">[ … ]</code> ou objet
              complet avec titre global{" "}
              <code className="font-mono">{"{ title: {…}, data: [ … ] }"}</code>
              .
            </p>
            <textarea
              className="flex-1 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:border-violet-400 focus:ring-3 focus:ring-violet-400/20"
              placeholder={PLACEHOLDER}
              value={raw}
              onChange={(e) => handleChange(e.target.value)}
              spellCheck={false}
            />
            {error && (
              <p className="text-xs text-destructive font-mono">{error}</p>
            )}
          </div>

          <Separator orientation="vertical" />

          {/* Colonne droite — aperçu */}
          <div className="flex flex-col min-h-0 p-4 gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-4 h-px bg-violet-400" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                Aperçu
                {parsed
                  ? ` — ${clips.length} clip${clips.length > 1 ? "s" : ""}`
                  : ""}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-1">
              {!parsed ? (
                <p className="text-xs text-muted-foreground text-center mt-8">
                  {raw.trim() ? "JSON invalide" : "En attente de données…"}
                </p>
              ) : (
                <>
                  {/* Titre global */}
                  {g && (
                    <div className="rounded-md border border-border px-3 py-2 text-xs mb-2 flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        Titre global
                      </span>
                      {g.first && (
                        <span className="font-medium">{g.first}</span>
                      )}
                      {g.second && (
                        <span className="font-medium">{g.second}</span>
                      )}
                      {g.subtitle && (
                        <span className="text-muted-foreground">
                          {g.subtitle}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Clips */}
                  {clips.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Aucun clip
                    </p>
                  ) : (
                    clips.map((clip, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-md border border-border px-3 py-2 text-xs"
                      >
                        <span className="text-muted-foreground tabular-nums w-5 shrink-0 pt-0.5">
                          {clip.id ?? ""}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-medium truncate">
                            {clip.title || (
                              <span className="text-muted-foreground italic">
                                sans titre
                              </span>
                            )}
                          </span>
                          {clip.subtitle && (
                            <span className="block text-muted-foreground truncate">
                              {clip.subtitle}
                            </span>
                          )}
                          {clip.url && (
                            <span className="block text-muted-foreground truncate font-mono">
                              {clip.url}
                            </span>
                          )}
                          <span className="flex gap-3 mt-0.5 text-muted-foreground">
                            {clip.start_time && (
                              <span>⏱ {clip.start_time}</span>
                            )}
                            {clip.duration && <span>⏳ {clip.duration}s</span>}
                          </span>
                        </span>
                        {!clip.url && (
                          <XIcon className="size-3 text-destructive shrink-0 mt-0.5" />
                        )}
                      </div>
                    ))
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={handleClose}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={!parsed || clips.length === 0}
              >
                Importer {parsed && clips.length > 0 ? `(${clips.length})` : ""}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
