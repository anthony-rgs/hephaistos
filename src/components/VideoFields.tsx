import { useState } from "react";
import { ClapperboardIcon, InfoIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateClip } from "@/store/createVideoSlice";
import VideoPickerDialog from "./VideoPickerDialog";
import type { VideoSelection } from "./VideoPickerDialog";

export default function VideoFields({ clipIndex }: { clipIndex: number }) {
  const dispatch = useAppDispatch();
  const clip = useAppSelector((s) => s.createVideo.clips[clipIndex]);
  const teaserTop = useAppSelector((s) => s.createVideo.teaserTop);
  const [open, setOpen] = useState(false);
  const [lastSearchedTitle, setLastSearchedTitle] = useState("");

  if (!clip) return null;

  const hiddenByTeaser = clipIndex === 0 && teaserTop;

  const handleConfirm = (sel: VideoSelection) => {
    dispatch(
      updateClip({
        index: clipIndex,
        data: { url: sel.url, start_time: sel.start, duration: sel.duration },
      }),
    );
  };

  return (
    <>
      <div className="grid grid-cols-[7rem_1fr_2.25rem] items-center gap-x-3 gap-y-3">
        {!hiddenByTeaser && (
          <>
            <Label className="justify-end text-muted-foreground">
              URL vidéo
            </Label>
            <Input
              value={clip.url}
              placeholder="Aucune vidéo sélectionnée"
              className="text-xs"
              onChange={(e) =>
                dispatch(
                  updateClip({
                    index: clipIndex,
                    data: { url: e.target.value },
                  }),
                )
              }
            />
            <Button
              size="icon-sm"
              variant="ghost"
              className="shrink-0 text-teal-400 hover:text-teal-400"
              onClick={() => setOpen(true)}
              title="Choisir une vidéo"
            >
              <ClapperboardIcon className="size-3.5" />
            </Button>

            <Label className="justify-end text-muted-foreground">
              Début extrait
            </Label>
            <Input
              value={clip.start_time}
              placeholder="00:00:00"
              onChange={(e) =>
                dispatch(
                  updateClip({
                    index: clipIndex,
                    data: { start_time: e.target.value },
                  }),
                )
              }
            />
            <div />
          </>
        )}

        <Label className="justify-end text-muted-foreground">Durée (s)</Label>
        <Input
          type="number"
          min={0}
          value={clip.duration}
          onChange={(e) =>
            dispatch(
              updateClip({
                index: clipIndex,
                data: { duration: Number(e.target.value) },
              }),
            )
          }
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <InfoIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="max-w-48 text-center"
            >
              {hiddenByTeaser
                ? "Durée d'affichage du titre en chevauchement sur l'extrait précédent"
                : "Durée de l'extrait en secondes"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <VideoPickerDialog
        open={open}
        onOpenChange={setOpen}
        initial={{
          url: clip.url,
          start: clip.start_time,
          duration: clip.duration,
        }}
        initialTitle={clip.title}
        autoSearch={clip.title !== lastSearchedTitle}
        onAutoSearchDone={() => setLastSearchedTitle(clip.title)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
