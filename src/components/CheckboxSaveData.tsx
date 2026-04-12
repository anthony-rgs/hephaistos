import { useDispatch, useSelector } from "react-redux";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "./ui/field";
import { Checkbox } from "./ui/checkbox";
import { setSaveStep1Checked, setSaveStep2Checked } from "@/store/createVideoSlice";
import type { RootState } from "@/store";

export default function CheckboxSaveData({ target }: { target: "step1" | "step2" }) {
  const dispatch = useDispatch();
  const checked = useSelector((state: RootState) =>
    target === "step1"
      ? state.createVideo.saveStep1Checked
      : state.createVideo.saveStep2Checked
  );

  const handleChange = (val: boolean) => {
    if (target === "step1") dispatch(setSaveStep1Checked(val));
    else dispatch(setSaveStep2Checked(val));
  };

  return (
    <FieldLabel>
      <Field orientation="horizontal">
        <Checkbox
          id={`toggle-checkbox-save-${target}`}
          name={`toggle-checkbox-save-${target}`}
          checked={checked}
          onCheckedChange={(val) => handleChange(val === true)}
        />
        <FieldContent>
          <FieldTitle>Sauvegarder les paramètres</FieldTitle>
          <FieldDescription>
            {target === "step1"
              ? "Enregistre le template et le mode sélectionnés comme valeurs par défaut."
              : "Enregistre les styles, polices, couleurs et paramètres de rendu comme valeurs par défaut pour ce template."}
          </FieldDescription>
        </FieldContent>
      </Field>
    </FieldLabel>
  );
}
