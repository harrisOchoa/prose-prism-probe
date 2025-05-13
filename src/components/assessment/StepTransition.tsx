
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ANIMATION_TYPES } from "@/utils/animation";

interface StepTransitionProps {
  loading: boolean;
  message: string;
  className?: string;
}

const StepTransition: React.FC<StepTransitionProps> = ({ loading, message, className }) => {
  if (!loading) return null;

  return (
    <div className={cn(
      "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
      ANIMATION_TYPES.fadeIn,
      className
    )}>
      <div className={cn("text-center space-y-4", ANIMATION_TYPES.scaleIn)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-lg font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
};

export default StepTransition;
