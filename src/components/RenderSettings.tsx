import { useAppDispatch, useAppSelector } from "@/store";
import {
  setBackground,
  setVideoMargin,
  setSpacing,
  setSmoothTransition,
  setWatermark,
  setHighlightActive,
  setHighlightPreviewActiveIndex,
} from "@/store/createVideoSlice";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import ColorSwatchInput from "./ColorSwatchInput";

const FONTS = [
  { label: "Bebas Neue", value: "bebas" },
  { label: "DejaVu Sans", value: "dejavu" },
  { label: "Inter", value: "inter" },
  { label: "Inter Medium", value: "inter-medium" },
  { label: "Inter SemiBold", value: "inter-semibold" },
  { label: "Montserrat", value: "montserrat" },
  { label: "Montserrat Light", value: "montserrat-light" },
  { label: "Montserrat Medium", value: "montserrat-medium" },
  { label: "Helvetica", value: "helvetica" },
  { label: "Helvetica Bold", value: "helvetica-bold" },
  { label: "Helvetica Black", value: "helvetica-black" },
];

export default function RenderSettings() {
  const dispatch = useAppDispatch();
  const {
    templateFeatures: features,
    background,
    videoMargin,
    spacing,
    smoothTransition,
    watermark,
    highlightActive,
    clips,
  } = useAppSelector((s) => s.createVideo);

  function handleHighlightPreview() {
    const total = clips.length;
    // Du dernier vers le premier (template top : dernier en haut)
    for (let i = total - 1; i >= 0; i--) {
      const step = total - 1 - i;
      setTimeout(() => {
        dispatch(setHighlightPreviewActiveIndex(i));
      }, step * 2000);
    }
    // Fin : reset
    setTimeout(() => {
      dispatch(setHighlightPreviewActiveIndex(null));
    }, total * 2000);
  }

  // background est "video" ou "0xRRGGBB"
  const bgSelectValue =
    background === "video"
      ? "video"
      : background === "0xFFFFFF"
        ? "white"
        : background === "0x000000"
          ? "black"
          : "custom";

  function handleBgSelect(v: string) {
    if (v === "video") dispatch(setBackground("video"));
    else if (v === "white") dispatch(setBackground("0xFFFFFF"));
    else if (v === "black") dispatch(setBackground("0x000000"));
    else
      dispatch(
        setBackground(bgSelectValue === "custom" ? background : "0x3A3A3A"),
      );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between gap-5">
        {/* Smooth Transition */}
        {features.includes("smoothTransition") && (
          <>
            <div className="flex flex-col gap-3 w-full">
              <Label>Transition douce</Label>
              <Select
                value={smoothTransition.active ? "custom" : "none"}
                onValueChange={(v) =>
                  dispatch(setSmoothTransition({ active: v === "custom" }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  <SelectItem value="custom">Personnalisée</SelectItem>
                </SelectContent>
              </Select>
              {smoothTransition.active && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Durée (s)
                  </Label>
                  <Input
                    className="text-xs"
                    type="number"
                    min={0.1}
                    max={2}
                    step={0.1}
                    value={smoothTransition.duration}
                    onChange={(e) =>
                      dispatch(
                        setSmoothTransition({
                          duration: Number(e.target.value),
                        }),
                      )
                    }
                  />
                </div>
              )}
            </div>
          </>
        )}

        <Separator orientation="vertical" />

        {/* Background */}
        {features.includes("background") && (
          <>
            <div className="flex flex-col gap-3 w-full">
              <Label>Fond</Label>
              <Select
                value={bgSelectValue}
                onValueChange={handleBgSelect}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vidéo (floutée)</SelectItem>
                  <SelectItem value="white">Blanc</SelectItem>
                  <SelectItem value="black">Noir</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>

              {bgSelectValue === "custom" && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Code couleur
                  </Label>
                  <ColorSwatchInput
                    value={background}
                    onChange={(v) => dispatch(setBackground(v))}
                  />
                </div>
              )}
            </div>
          </>
        )}

        <Separator orientation="vertical" />

        <div className="w-full flex flex-col gap-3">
          {/* Video Margin */}
          {features.includes("videoMargin") && (
            <div className="flex flex-col  w-full gap-3">
              <Label>Marge vidéo (px)</Label>
              <Input
                type="number"
                min={0}
                value={videoMargin}
                onChange={(e) =>
                  dispatch(setVideoMargin(Number(e.target.value)))
                }
              />
            </div>
          )}

          {/* Spacing */}
          {features.includes("spacing") && (
            <div className="flex flex-col gap-2">
              <Label>Espacement titres/vidéo (px)</Label>
              <Input
                type="number"
                min={0}
                value={spacing}
                onChange={(e) => dispatch(setSpacing(Number(e.target.value)))}
              />
            </div>
          )}
        </div>
      </div>

      <Separator className="max-w-[55%] m-auto" />

      <div className="flex justify-between gap-5">
        {/* Watermark */}
        {features.includes("watermark") && (
          <div className="flex flex-col gap-3 w-full">
            <Label>Filigrane</Label>
            <Select
              value={watermark.active ? "custom" : "none"}
              onValueChange={(v) =>
                dispatch(setWatermark({ active: v === "custom" }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun</SelectItem>
                <SelectItem value="custom">Personnalisé</SelectItem>
              </SelectContent>
            </Select>
            {watermark.active && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Texte</Label>
                  <Input
                    value={watermark.text}
                    onChange={(e) =>
                      dispatch(setWatermark({ text: e.target.value }))
                    }
                    placeholder="@moncompte"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Police
                  </Label>
                  <Select
                    value={watermark.font}
                    onValueChange={(v) => dispatch(setWatermark({ font: v }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map((f) => (
                        <SelectItem
                          key={f.value}
                          value={f.value}
                        >
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Taille
                  </Label>
                  <Input
                    type="number"
                    min={10}
                    value={watermark.size}
                    onChange={(e) =>
                      dispatch(setWatermark({ size: Number(e.target.value) }))
                    }
                    className="h-8 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Couleur
                  </Label>
                  <ColorSwatchInput
                    value={watermark.color}
                    onChange={(v) => dispatch(setWatermark({ color: v }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Opacité (0–1)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={watermark.opacity}
                    onChange={(e) =>
                      dispatch(
                        setWatermark({ opacity: Number(e.target.value) }),
                      )
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Highlight Active */}
        {features.includes("highlightActive") && (
          <>
            <Separator orientation="vertical" />
            <div className="flex flex-col gap-3 w-full">
              <Label>Mise en avant du clip actif</Label>
              <Select
                value={highlightActive.active ? "custom" : "none"}
                onValueChange={(v) =>
                  dispatch(setHighlightActive({ active: v === "custom" }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  <SelectItem value="custom">Personnalisée</SelectItem>
                </SelectContent>
              </Select>

              {highlightActive.active && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Couleur des clips inactifs
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <ColorSwatchInput
                      value={highlightActive.inactiveColor}
                      onChange={(v) =>
                        dispatch(setHighlightActive({ inactiveColor: v }))
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={handleHighlightPreview}
                    >
                      Aperçu
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
