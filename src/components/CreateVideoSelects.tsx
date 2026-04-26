import SelectTemplate from "./SelectTemplate";
import SelectMode from "./SelectMode";
import CheckboxSaveData from "./CheckboxSaveData";

export default function CreateVideoSelects() {
  return (
    <div className="flex flex-col gap-8 pt-4">
      <SelectTemplate />
      <div className="h-px bg-border" />
      <SelectMode />
      <div className="h-px bg-border" />
      <CheckboxSaveData target="step1" />
    </div>
  );
}
