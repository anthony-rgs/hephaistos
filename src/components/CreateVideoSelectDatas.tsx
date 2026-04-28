import { Button } from "./ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { addClip, removeClip } from "@/store/createVideoSlice";
import TextStyleFields from "./TextStyleFields";
import VideoFields from "./VideoFields";
import GlobalTitleFields from "./GlobalTitleFields";
import CheckboxSaveData from "./CheckboxSaveData";
import RenderSettings from "./RenderSettings";
import { PlusIcon, Trash2Icon } from "lucide-react";

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className="w-4 h-px bg-violet-400" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
          {eyebrow}
        </span>
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
    </div>
  );
}

export default function CreateVideoSelectDatas() {
  const dispatch = useAppDispatch();
  const clips = useAppSelector((s) => s.createVideo.clips);
  const features = useAppSelector((s) => s.createVideo.templateFeatures);

  return (
    <div className="flex flex-col gap-8">
      {/* Titre global */}
      {features.includes("globalTitle") && (
        <div className="flex flex-col gap-4">
          <SectionHeader
            eyebrow="Global"
            title="Titre global"
          />
          <GlobalTitleFields />
          <div className="h-px bg-border" />
        </div>
      )}

      {/* Extraits */}
      {clips.map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <SectionHeader
              eyebrow={`Extrait ${index + 1}`}
              title="Texte & vidéo"
            />
            {clips.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => dispatch(removeClip(index))}
              >
                <Trash2Icon className="size-3.5" />
                Supprimer
              </Button>
            )}
          </div>
          <TextStyleFields clipIndex={index} />
          <VideoFields clipIndex={index} />

          {index < clips.length - 1 && <div className="mt-3 h-px bg-border" />}
        </div>
      ))}

      <button
        onClick={() => dispatch(addClip())}
        className="group flex items-center gap-3 w-full py-1 text-muted-foreground hover:text-violet-400 transition-colors"
      >
        <span className="h-px flex-1 border-t border-dashed border-current opacity-30 group-hover:opacity-60 transition-opacity" />
        <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase shrink-0">
          <PlusIcon className="size-3" />
          Ajouter un extrait
        </span>
        <span className="h-px flex-1 border-t border-dashed border-current opacity-30 group-hover:opacity-60 transition-opacity" />
      </button>

      <div className="h-px bg-border" />

      {/* Paramètres rendu */}
      <div className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Rendu"
          title="Paramètres"
        />
        <RenderSettings />
      </div>

      <div className="h-px bg-border" />

      <CheckboxSaveData target="step2" />
    </div>
  );
}
