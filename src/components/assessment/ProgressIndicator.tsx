
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
  color?: string;
}

const ProgressIndicator = ({ currentStep, totalSteps, label, color }: ProgressIndicatorProps) => {
  const progress = Math.max(0, Math.min(100, (currentStep / totalSteps) * 100));

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
        color={color}
      />
    </div>
  );
};

export default ProgressIndicator;
