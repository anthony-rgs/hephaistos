import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "./ui/field";
import { capitalize, templates } from "@/utils";
import { FAKE_PREVIEW } from "@/utils/constants/fakePreview.constants";
import { setTemplate } from "@/store/createVideoSlice";
import type { RootState } from "@/store";
import TemplatePreview from "./TemplatePreview";

function FrozenThumbnail({ templateLabel, width, height }: { templateLabel: string; width: number; height: number }) {
  const bgSrc = FAKE_PREVIEW[templateLabel]?.bgSrc;
  const [frozenSrc, setFrozenSrc] = useState<string>();

  useEffect(() => {
    if (!bgSrc) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")?.drawImage(img, 0, 0);
      setFrozenSrc(c.toDataURL("image/jpeg", 0.85));
    };
    img.src = bgSrc;
  }, [bgSrc]);

  if (!frozenSrc) return <div className="w-full h-full bg-muted/60" />;

  return (
    <TemplatePreview
      mode="fake"
      templateOverride={templateLabel}
      fakeOverride={{ bgSrc: frozenSrc }}
    />
  );
}

const THUMB_H = 96;
const THUMB_W = Math.round((THUMB_H * 9) / 16);

export default function SelectTemplate() {
  const dispatch = useDispatch();
  const templateValue = useSelector((state: RootState) => state.createVideo.templateValue);

  return (
    <div>
      <div className="flex flex-col gap-0.5 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-4 h-px bg-violet-400" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">Étape 1</span>
        </div>
        <h3 className="text-base font-semibold tracking-tight">Sélectionner un template</h3>
      </div>

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
              {/* Miniature — GIF animé si sélectionné, premier frame figé sinon */}
              <div
                className="hidden xl:block rounded-md overflow-hidden border border-border shrink-0"
                style={{ width: THUMB_W, height: THUMB_H }}
              >
                {template.label === templateValue ? (
                  <TemplatePreview
                    mode="fake"
                    templateOverride={template.label}
                    fakeOverride={{ bgSrc: FAKE_PREVIEW[template.label]?.bgSrc }}
                  />
                ) : (
                  <FrozenThumbnail
                    templateLabel={template.label}
                    width={THUMB_W}
                    height={THUMB_H}
                  />
                )}
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
