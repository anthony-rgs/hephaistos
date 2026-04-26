import type { ReactNode } from "react";
import { Button } from "./ui/button";

const TOTAL_STEPS = 3;

type Props = {
  currentStep: number;
  onPrev: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showPrev?: boolean;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
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
    <div className="shrink-0 grid grid-cols-3 items-center py-4">
      {/* Left */}
      <div className="flex justify-start">
        {leftAction ?? (
          <Button
            variant="ghost"
            onClick={onPrev}
            className={!prevVisible ? "invisible" : ""}
          >
            Retour
          </Button>
        )}
      </div>

      {/* Center — toujours centré */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={`rounded-full transition-all ${
              i + 1 === currentStep
                ? "w-4 h-1.5 bg-violet-400"
                : i + 1 < currentStep
                  ? "w-1.5 h-1.5 bg-violet-400/40"
                  : "w-1.5 h-1.5 bg-border"
            }`}
          />
        ))}
      </div>

      {/* Right */}
      <div className="flex justify-end">
        {rightAction ?? (
          <Button onClick={onNext} disabled={nextDisabled}>
            {label}
          </Button>
        )}
      </div>
    </div>
  );
}
