
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

const ProgressIndicator = ({ currentStep, totalSteps, label }: ProgressIndicatorProps) => {
  const progress = Math.max(0, Math.min(100, (currentStep / totalSteps) * 100));
  const progressColor = progress === 100 ? "#22c55e" : undefined;

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          <span>{`${currentStep} of ${totalSteps}`}</span>
        </div>
      )}
      <Progress 
        value={progress} 
        className="h-2"
        color={progressColor}
      />
    </div>
  );
};

export default ProgressIndicator;
