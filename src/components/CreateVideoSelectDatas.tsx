import { useState } from "react";
import { CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useAppDispatch, useAppSelector } from "@/store";
import { addClip, removeClip } from "@/store/createVideoSlice";
import TextStyleFields from "./TextStyleFields";
import VideoFields from "./VideoFields";
import GlobalTitleFields from "./GlobalTitleFields";
import CheckboxSaveData from "./CheckboxSaveData";
import BillionsClubDialog from "./BillionsClubDialog";
import ImportJsonDialog from "./ImportJsonDialog";
import RenderSettings from "./RenderSettings";

export default function CreateVideoSelectDatas() {
  const dispatch = useAppDispatch();
  const clips = useAppSelector((s) => s.createVideo.clips);
  const features = useAppSelector((s) => s.createVideo.templateFeatures);
  const [billionsOpen, setBillionsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items">
        <CardTitle className="flex items-center">
          Sélectionner un template
        </CardTitle>
        <div className="flex gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBillionsOpen(true)}
          >
            Billions Club Data
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setImportOpen(true)}
          >
            + Importer un Json
          </Button>
        </div>
      </div>

      {features.includes("globalTitle") && (
        <>
          <CardTitle>Titre global</CardTitle>
          <GlobalTitleFields />
          <Separator />
        </>
      )}

      {clips.map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4"
        >
          <div className="flex justify-between items-center">
            <CardTitle>Extrait {index + 1}</CardTitle>
            {clips.length > 1 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => dispatch(removeClip(index))}
              >
                Supprimer
              </Button>
            )}
          </div>

          <TextStyleFields clipIndex={index} />
          <VideoFields clipIndex={index} />

          {index < clips.length - 1 && <Separator />}
        </div>
      ))}

      <Separator />

      <Button
        variant="outline"
        onClick={() => dispatch(addClip())}
      >
        + Ajouter un extrait
      </Button>

      <Separator />

      <CardTitle>Paramètres</CardTitle>
      <RenderSettings />

      <Separator />

      <CheckboxSaveData target="step2" />

      <BillionsClubDialog
        open={billionsOpen}
        onOpenChange={setBillionsOpen}
      />

      <ImportJsonDialog
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </div>
  );
}
