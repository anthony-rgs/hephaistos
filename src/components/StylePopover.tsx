import { useState } from "react";
import { PaletteIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StyleBase {
  border: number;
  color: string; // "0xRRGGBB" | "video"
  font: string;
  size: number;
}

export interface StyleExtended extends StyleBase {
  animation: string;
  position: "left" | "center";
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

const ANIMATIONS = [
  { label: "Aucune", value: "none" },
  { label: "Fondu", value: "fade" },
  { label: "Machine à écrire", value: "typewriter" },
  { label: "Glissement gauche", value: "slide-left" },
  { label: "Glissement bas", value: "slide-bottom" },
];

const POSITIONS = [
  { label: "Gauche", value: "left" },
  { label: "Centre", value: "center" },
];

const COLOR_PRESETS = [
  { label: "Blanc", value: "0xFFFFFF" },
  { label: "Noir", value: "0x000000" },
  { label: "Personnalisé", value: "custom" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function storeToHex(color: string): string {
  if (!color.startsWith("0x")) return "#ffffff";
  return "#" + color.slice(2).toLowerCase();
}

function hexToStore(hex: string): string {
  return "0x" + hex.slice(1).toUpperCase();
}

function getPresetKey(color: string): string {
  if (color === "0xFFFFFF" || color === "0xffffff") return "0xFFFFFF";
  if (color === "0x000000") return "0x000000";
  return "custom";
}

function isExtended(style: StyleBase | StyleExtended): style is StyleExtended {
  return "animation" in style;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StylePopover<T extends StyleBase>({
  label,
  style,
  onChange,
  onApplyAll,
}: {
  label: string;
  style: T;
  onChange: (s: T) => void;
  onApplyAll?: (s: T) => void;
}) {
  const initialPreset = getPresetKey(style.color);
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [customHex, setCustomHex] = useState(
    initialPreset === "custom" ? storeToHex(style.color) : "#ffffff",
  );
  const [inputText, setInputText] = useState(
    initialPreset === "custom"
      ? hexToStore(storeToHex(style.color))
      : "0xFFFFFF",
  );

  // Sync depuis l'extérieur (applyAll) : on compare la couleur précédente
  const [syncedColor, setSyncedColor] = useState(style.color);
  if (style.color !== syncedColor) {
    setSyncedColor(style.color);
    const preset = getPresetKey(style.color);
    setSelectedPreset(preset);
    if (preset === "custom") {
      const hex = storeToHex(style.color);
      setCustomHex(hex);
      setInputText(hexToStore(hex));
    }
  }

  const handleColorPreset = (value: string) => {
    setSelectedPreset(value);
    if (value === "custom") {
      onChange({ ...style, color: hexToStore(customHex) });
    } else {
      onChange({ ...style, color: value });
    }
  };

  const handlePickerChange = (hex: string) => {
    setCustomHex(hex);
    setInputText(hexToStore(hex));
    onChange({ ...style, color: hexToStore(hex) });
  };

  const handleInputText = (raw: string) => {
    setInputText(raw);
    const normalized = raw.trim().replace(/^0x/i, "#");
    if (/^#[0-9a-f]{6}$/i.test(normalized)) {
      setCustomHex(normalized);
      onChange({ ...style, color: hexToStore(normalized) });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          tabIndex={-1}
          size="icon-sm"
          variant="ghost"
          className="shrink-0 text-violet-400 hover:text-violet-400"
          title={`Style — ${label}`}
        >
          <PaletteIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="gap-3 w-64"
      >
        <div className="flex flex-col gap-0.5 pb-1">
          <div className="flex items-center gap-2">
            <span className="w-4 h-px bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">Style</span>
          </div>
          <h3 className="text-sm font-semibold tracking-tight">{label}</h3>
        </div>
        <div className="h-px bg-border -mx-2.5" />

        {/* Font */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Police</Label>
          <Select
            value={style.font}
            onValueChange={(v) => onChange({ ...style, font: v })}
          >
            <SelectTrigger
              size="sm"
              className="w-full"
            >
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

        {/* Taille + Bordure */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Taille</Label>
            <Input
              type="number"
              min={1}
              value={style.size}
              onChange={(e) =>
                onChange({ ...style, size: Number(e.target.value) })
              }
              className="h-7 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Bordure</Label>
            <Input
              type="number"
              min={0}
              value={style.border}
              onChange={(e) =>
                onChange({ ...style, border: Number(e.target.value) })
              }
              className="h-7 text-xs"
            />
          </div>
        </div>

        {/* Couleur */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Couleur</Label>
          <Select
            value={selectedPreset}
            onValueChange={handleColorPreset}
          >
            <SelectTrigger
              size="sm"
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLOR_PRESETS.map((c) => (
                <SelectItem
                  key={c.value}
                  value={c.value}
                >
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPreset === "custom" && (
            <div className="flex items-center gap-2 mt-1">
              <div
                className="relative size-7 shrink-0 rounded border border-border cursor-pointer overflow-hidden"
                style={{ backgroundColor: customHex }}
              >
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => handlePickerChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer size-full"
                />
              </div>
              <Input
                value={inputText}
                onChange={(e) => handleInputText(e.target.value)}
                className="h-7 font-mono text-xs"
                placeholder="0xFFFFFF"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* Animation + Position — uniquement pour les styles étendus */}
        {isExtended(style) && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Animation</Label>
              <Select
                value={style.animation}
                onValueChange={(v) => onChange({ ...style, animation: v } as T)}
              >
                <SelectTrigger
                  size="sm"
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANIMATIONS.map((a) => (
                    <SelectItem
                      key={a.value}
                      value={a.value}
                      onPointerDown={() => {
                        // Même valeur déjà sélectionnée → force un onChange pour retrigger l'anim
                        if (isExtended(style) && style.animation === a.value) {
                          onChange({ ...style } as T);
                        }
                      }}
                    >
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Position</Label>
              <Select
                value={style.position}
                onValueChange={(v) =>
                  onChange({ ...style, position: v as "left" | "center" } as T)
                }
              >
                <SelectTrigger
                  size="sm"
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((p) => (
                    <SelectItem
                      key={p.value}
                      value={p.value}
                    >
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {onApplyAll && (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => onApplyAll(style)}
          >
            Tout appliquer
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
