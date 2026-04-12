import type { ReactNode } from "react";
import { Button } from "./ui/button";
import { CardFooter } from "./ui/card";

const TOTAL_STEPS = 3;

type Props = {
  currentStep: number;
  onPrev: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showPrev?: boolean;
  leftAction?: ReactNode;   // remplace le bouton Retour
  rightAction?: ReactNode;  // remplace le bouton Suivant
};

export default function CardFooterCustom({
  currentStep,
  onPrev,
  onNext,
  nextLabel,
  nextDisabled,
  showPrev,
  leftAction,
  rightAction,
}: Props) {
  const label = nextLabel ?? "Suivant";
  const prevVisible = showPrev !== undefined ? showPrev : currentStep > 1;

  return (
    <CardFooter className="flex justify-between">
      {leftAction ?? (
        <Button
          variant="ghost"
          onClick={onPrev}
          className={!prevVisible ? "invisible" : ""}
        >
          Retour
        </Button>
      )}
      <span className="text-sm text-muted-foreground">
        Étape {currentStep}/{TOTAL_STEPS}
      </span>
      {rightAction ?? (
        <Button onClick={onNext} disabled={nextDisabled}>
          {label}
        </Button>
      )}
    </CardFooter>
  );
}
