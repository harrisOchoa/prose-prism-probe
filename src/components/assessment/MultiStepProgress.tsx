
import React from "react";
import { Check, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ANIMATION_TYPES } from "@/utils/animation";

export type StepStatus = 'pending' | 'loading' | 'complete' | 'error' | 'rate_limited';

export interface AnalysisStep {
  id: string;
  label: string;
  status: StepStatus;
  description?: string;
}

interface MultiStepProgressProps {
  steps: AnalysisStep[];
  currentStepIndex: number;
  className?: string;
}

const MultiStepProgress: React.FC<MultiStepProgressProps> = ({
  steps,
  currentStepIndex,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStepIndex;
        const isCompleted = step.status === 'complete';
        const isError = step.status === 'error';
        const isLoading = step.status === 'loading';
        const isRateLimited = step.status === 'rate_limited';
        
        return (
          <div 
            key={step.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-md transition-all duration-300",
              isActive && "bg-muted/50 shadow-sm",
              isCompleted && "text-green-600",
              isError && "text-red-500",
              isRateLimited && "text-amber-500",
              ANIMATION_TYPES.fadeIn
            )}
          >
            <div className="flex items-center justify-center w-6 h-6 mt-0.5">
              {isLoading && (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
              {isCompleted && (
                <Check className="h-5 w-5 text-green-600" />
              )}
              {isError && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              {isRateLimited && (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              {(!isLoading && !isCompleted && !isError && !isRateLimited) && (
                <div className={cn(
                  "w-4 h-4 rounded-full border-2",
                  isActive ? "border-primary" : "border-muted-foreground/40"
                )} />
              )}
            </div>
            <div className="space-y-1">
              <p className={cn(
                "font-medium text-sm",
                isActive && "text-primary"
              )}>
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MultiStepProgress;
