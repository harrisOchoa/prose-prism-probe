
import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
  color?: string;
  showAnimation?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  label, 
  color,
  showAnimation = true,
  showPercentage = false,
  size = 'md',
  className
}: ProgressIndicatorProps) => {
  const progress = Math.max(0, Math.min(100, (currentStep / totalSteps) * 100));
  
  const heightClass = {
    'sm': 'h-1',
    'md': 'h-2',
    'lg': 'h-3'
  }[size];

  return (
    <div className={cn("w-full space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm text-muted-foreground">
          {label && <span>{label}</span>}
          {showPercentage ? (
            <span>{Math.round(progress)}%</span>
          ) : (
            <span>{`${currentStep} of ${totalSteps}`}</span>
          )}
        </div>
      )}
      <Progress 
        value={progress} 
        className={cn(
          heightClass,
          showAnimation && progress < 100 && "animate-pulse-subtle",
          color ? `bg-${color}-100` : undefined
        )}
        color={color}
      />
    </div>
  );
};

export default ProgressIndicator;
