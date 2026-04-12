import { useDispatch, useSelector } from "react-redux";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "./ui/field";
import { CardTitle } from "./ui/card";
import { capitalize, templates } from "@/utils";
import { FAKE_PREVIEW } from "@/utils/constants/fakePreview.constants";
import { setTemplate } from "@/store/createVideoSlice";
import type { RootState } from "@/store";
import TemplatePreview from "./TemplatePreview";

const THUMB_H = 96;
const THUMB_W = Math.round((THUMB_H * 9) / 16);

export default function SelectTemplate() {
  const dispatch = useDispatch();
  const templateValue = useSelector((state: RootState) => state.createVideo.templateValue);

  return (
    <div>
      <CardTitle className="mb-4">Sélectionner un template</CardTitle>

      <RadioGroup
        value={templateValue}
        className="grid grid-cols-2 gap-4"
        onValueChange={(value) => dispatch(setTemplate(value))}
      >
        {templates.map((template) => (
          <FieldLabel
            htmlFor={`${template.label}-plan`}
            key={`${template.label}-key`}
          >
            <Field orientation="horizontal">
              {/* Miniature preview — masquée en-dessous de 1280px */}
              <div
                className="hidden xl:block rounded-md overflow-hidden border border-border shrink-0"
                style={{ width: THUMB_W, height: THUMB_H }}
              >
                <TemplatePreview
                  mode="fake"
                  templateOverride={template.label}
                  fakeOverride={{ bgSrc: FAKE_PREVIEW[template.label]?.bgSrc }}
                />
              </div>

              <FieldContent>
                <FieldTitle>{capitalize(template.label)}</FieldTitle>
                <FieldDescription>{template.description}</FieldDescription>
              </FieldContent>
              <RadioGroupItem
                value={template.label}
                id={`${template.label}-plan`}
              />
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
    </div>
  );
}
