import { useAppDispatch, useAppSelector } from "@/store";
import { updateClip, setTeaserTop } from "@/store/createVideoSlice";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import StylePopover from "./StylePopover";

export default function TextStyleFields({ clipIndex }: { clipIndex: number }) {
  const dispatch = useAppDispatch();
  const clip = useAppSelector((s) => s.createVideo.clips[clipIndex]);
  const clips = useAppSelector((s) => s.createVideo.clips);
  const teaserTop = useAppSelector((s) => s.createVideo.teaserTop);
  const features = useAppSelector((s) => s.createVideo.templateFeatures);

  if (!clip) return null;

  const showTeaserToggle = clipIndex === 0 && features.includes("teaserTop");
  const showId = features.includes("id");
  const showSecondTitle = features.includes("secondTitle");

  const handleTeaserToggle = (checked: boolean) => {
    dispatch(setTeaserTop(checked));
    dispatch(updateClip({ index: 0, data: { title: checked ? "???" : "" } }));
  };

  return (
    <div className="grid grid-cols-[7rem_1fr_2.25rem] items-center gap-x-3 gap-y-3">
      {showTeaserToggle && (
        <>
          <Label className="justify-end text-muted-foreground">Teaser top</Label>
          <Switch size="sm" checked={teaserTop} onCheckedChange={handleTeaserToggle} />
          <div />
        </>
      )}

      {showId && (
        <>
          <Label htmlFor={`id-${clipIndex}`} className="justify-end text-muted-foreground">ID</Label>
          <Input
            id={`id-${clipIndex}`}
            placeholder="ex: 42"
            value={clip.id}
            onChange={(e) => dispatch(updateClip({ index: clipIndex, data: { id: e.target.value } }))}
          />
          <StylePopover
            label="ID"
            style={clip.idStyle}
            onChange={(s) => dispatch(updateClip({ index: clipIndex, data: { idStyle: s } }))}
            onApplyAll={(s) => clips.forEach((_, i) => dispatch(updateClip({ index: i, data: { idStyle: s } })))}
          />
        </>
      )}

      <Label htmlFor={`title-${clipIndex}`} className="justify-end text-muted-foreground">Titre</Label>
      <Input
        id={`title-${clipIndex}`}
        placeholder="Titre principal"
        value={clip.title}
        onChange={(e) => dispatch(updateClip({ index: clipIndex, data: { title: e.target.value } }))}
      />
      <StylePopover
        label="Titre"
        style={clip.titleStyle}
        onChange={(s) => dispatch(updateClip({ index: clipIndex, data: { titleStyle: s } }))}
        onApplyAll={(s) => clips.forEach((_, i) => dispatch(updateClip({ index: i, data: { titleStyle: s } })))}
      />

      {showSecondTitle && (
        <>
          <Label htmlFor={`subtitle-${clipIndex}`} className="justify-end text-muted-foreground">Second titre</Label>
          <Input
            id={`subtitle-${clipIndex}`}
            placeholder="Sous-titre"
            value={clip.subtitle}
            onChange={(e) => dispatch(updateClip({ index: clipIndex, data: { subtitle: e.target.value } }))}
          />
          <StylePopover
            label="Second titre"
            style={clip.subtitleStyle}
            onChange={(s) => dispatch(updateClip({ index: clipIndex, data: { subtitleStyle: s } }))}
            onApplyAll={(s) => clips.forEach((_, i) => dispatch(updateClip({ index: i, data: { subtitleStyle: s } })))}
          />
        </>
      )}
    </div>
  );
}
