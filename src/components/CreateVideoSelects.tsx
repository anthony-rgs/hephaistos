import SelectTemplate from "./SelectTemplate";
import SelectMode from "./SelectMode";
import { Separator } from "./ui/separator";
import CheckboxSaveData from "./CheckboxSaveData";

export default function CreateVideoSelects() {
  return (
    <>
      <SelectTemplate />
      <Separator />
      <SelectMode />
      <Separator />
      <CheckboxSaveData target="step1" />
    </>
  );
}
