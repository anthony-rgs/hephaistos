import { XIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { ApiTitle } from "@/utils/billionsClub.types";
import { formatStreams } from "@/utils/billionsClub.types";

export default function BillionsClubSelection({
  selected,
  labelFormat,
  onLabelFormatChange,
  onToggle,
  onClear,
  onCancel,
  onConfirm,
}: {
  selected: ApiTitle[];
  labelFormat: string;
  onLabelFormatChange: (v: string) => void;
  onToggle: (t: ApiTitle) => void;
  onClear: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex flex-col min-h-0 p-4 gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Sélectionnés ({selected.length})
        </p>
        {selected.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Tout effacer
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1">
        {selected.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center mt-8">
            Aucune sélection
          </p>
        ) : (
          selected.map((t, i) => (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs"
            >
              <span className="text-muted-foreground tabular-nums w-5 shrink-0">
                {i + 1}.
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-medium truncate">{t.name}</span>
                <span className="block text-muted-foreground truncate">
                  {t.artists.map((a) => a.artist_name).join(", ")}
                </span>
              </span>
              <span className="text-muted-foreground shrink-0 tabular-nums">
                {formatStreams(t.streams_count)}
              </span>
              <button
                onClick={() => onToggle(t)}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <XIcon className="size-3" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">Format</span>
          <Select
            value={labelFormat}
            onValueChange={onLabelFormatChange}
          >
            <SelectTrigger
              size="sm"
              className="w-50"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title-artist-streams">
                Titre - Artiste (streams)
              </SelectItem>
              <SelectItem value="title-streams">Titre (streams)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={selected.length === 0}
          >
            Importer ({selected.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
