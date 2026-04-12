import { useState } from "react";
import { Input } from "./ui/input";

function storeToHex(c: string): string {
  if (!c.startsWith("0x")) return "#ffffff";
  return "#" + c.slice(2).toLowerCase();
}

function hexToStore(h: string): string {
  return "0x" + h.slice(1).toUpperCase();
}

export default function ColorSwatchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [inputText, setInputText] = useState(value);
  const [synced, setSynced] = useState(value);

  if (value !== synced) {
    setSynced(value);
    setInputText(value);
  }

  const hex = storeToHex(value);

  const handlePicker = (h: string) => {
    const store = hexToStore(h);
    setInputText(store);
    onChange(store);
  };

  const handleText = (raw: string) => {
    setInputText(raw);
    const normalized = raw.trim().replace(/^0x/i, "#");
    if (/^#[0-9a-f]{6}$/i.test(normalized)) {
      onChange(hexToStore(normalized));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative size-8 shrink-0 rounded border border-border cursor-pointer overflow-hidden"
        style={{ backgroundColor: hex }}
      >
        <input
          type="color"
          value={hex}
          onChange={(e) => handlePicker(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer size-full"
        />
      </div>
      <Input
        value={inputText}
        onChange={(e) => handleText(e.target.value)}
        className="font-mono text-xs"
        placeholder="0xFFFFFF"
        spellCheck={false}
      />
    </div>
  );
}
