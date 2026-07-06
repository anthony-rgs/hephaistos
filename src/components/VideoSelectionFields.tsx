import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function VideoSelectionFields({
  url,
  onUrlChange,
  start,
  onStartChange,
  duration,
  onDurationChange,
  syncTimecode,
  onToggleSync,
  onApplyAllDurations,
}: {
  url: string;
  onUrlChange: (url: string) => void;
  start: string;
  onStartChange: (start: string) => void;
  duration: number;
  onDurationChange: (duration: number) => void;
  syncTimecode: boolean;
  onToggleSync: () => void;
  onApplyAllDurations: () => void;
}) {
  return (
    <div className="grid grid-cols-[7rem_2fr_0.5fr] items-center gap-x-3 gap-y-3">
      <Label className="justify-end text-muted-foreground">URL vidéo</Label>
      <Input
        tabIndex={-1}
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://youtube.com/watch?v=..."
      />
      <div />

      <Label className="justify-end text-muted-foreground">Début extrait</Label>
      <Input
        value={start}
        onChange={(e) => onStartChange(e.target.value)}
        placeholder="00:00:00"
      />
      <div className="flex items-center justify-end gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                tabIndex={-1}
                onClick={onToggleSync}
                className={`shrink-0 flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide transition-colors border ${
                  syncTimecode
                    ? "border-violet-400/40 bg-violet-400/10 text-violet-400"
                    : "border-border text-muted-foreground"
                }`}
              >
                AUTO
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {syncTimecode
                ? "Timecode synchronisé — cliquer pour désactiver"
                : "Timecode manuel — cliquer pour activer la sync"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon-sm" variant="ghost" tabIndex={-1} className="shrink-0 text-muted-foreground">
                <span className="text-xs font-medium">i</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">heures:minutes:secondes</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Label className="justify-end text-muted-foreground">Durée (s)</Label>
      <Input
        type="number"
        min={0}
        value={duration}
        onChange={(e) => onDurationChange(Number(e.target.value))}
        placeholder="30"
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              tabIndex={-1}
              onClick={onApplyAllDurations}
              className="w-full flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide transition-colors border border-border text-muted-foreground hover:border-violet-400/40 hover:text-violet-400 hover:bg-violet-400/5"
            >
              TOUS
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Appliquer cette durée à tous les extraits (y compris les futurs)
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
