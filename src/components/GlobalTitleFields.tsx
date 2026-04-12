import { useAppDispatch, useAppSelector } from "@/store";
import { updateGlobalTitle } from "@/store/createVideoSlice";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import StylePopover from "./StylePopover";

export default function GlobalTitleFields() {
  const dispatch = useAppDispatch();
  const { first, second, titleStyle, subtitle, subtitleStyle } = useAppSelector(
    (s) => s.createVideo.globalTitle
  );

  return (
    <div className="grid grid-cols-[7rem_1fr_2.25rem] items-center gap-x-3 gap-y-3">
      <Label htmlFor="gt-first" className="justify-end text-muted-foreground">Titre (1)</Label>
      <Input
        id="gt-first"
        placeholder="TOP 7 Kanye West's"
        value={first}
        onChange={(e) => dispatch(updateGlobalTitle({ first: e.target.value }))}
      />
      <StylePopover
        label="Titre"
        style={titleStyle}
        onChange={(s) => dispatch(updateGlobalTitle({ titleStyle: s }))}
      />

      <Label htmlFor="gt-second" className="justify-end text-muted-foreground">Titre (2)</Label>
      <Input
        id="gt-second"
        placeholder="Most Streamed Songs Ever"
        value={second}
        onChange={(e) => dispatch(updateGlobalTitle({ second: e.target.value }))}
      />
      <div />

      <Label htmlFor="gt-subtitle" className="justify-end text-muted-foreground">Sous-titre</Label>
      <Input
        id="gt-subtitle"
        placeholder="(on Spotify)"
        value={subtitle}
        onChange={(e) => dispatch(updateGlobalTitle({ subtitle: e.target.value }))}
      />
      <StylePopover
        label="Sous-titre"
        style={subtitleStyle}
        onChange={(s) => dispatch(updateGlobalTitle({ subtitleStyle: s }))}
      />
    </div>
  );
}
