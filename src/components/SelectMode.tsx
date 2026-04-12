import { useDispatch, useSelector } from "react-redux";
import { CardTitle } from "./ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "./ui/field";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { capitalize } from "@/utils";
import { setModeValue } from "@/store/createVideoSlice";
import type { RootState } from "@/store";

export default function SelectMode() {
  const dispatch = useDispatch();
  const modeValue = useSelector(
    (state: RootState) => state.createVideo.modeValue,
  );

  const modeData = [
    {
      label: "default",
      description:
        "Les extraits s'enchaînent avec le titre et la vidéo visible dès le départ.",
    },
    {
      label: "blind-test",
      description:
        "Le clip est masqué quelques secondes et un compteur apparaît, puis le clip se révèle. Durée minimum de l'extrait 10 secondes.",
    },
  ];

  const handleValueChange = (value: string) => {
    dispatch(setModeValue(value));
  };

  return (
    <div>
      <CardTitle className="mb-4">Sélectionner un mode</CardTitle>

      <RadioGroup
        value={modeValue}
        className="grid grid-cols-2 gap-4"
        onValueChange={handleValueChange}
      >
        {modeData.map((mode) => (
          <FieldLabel
            htmlFor={`${mode.label}-plan`}
            key={`${mode.label}-key`}
            className=""
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>{capitalize(mode.label)}</FieldTitle>
                <FieldDescription>{mode.description}</FieldDescription>
              </FieldContent>
              <RadioGroupItem
                value={mode.label}
                id={`${mode.label}-plan`}
              />
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
    </div>
  );
}
