
import React from "react";
import { Loader2 } from "lucide-react";

interface StepTransitionProps {
  loading: boolean;
  message: string;
}

const StepTransition: React.FC<StepTransitionProps> = ({ loading, message }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-lg font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default StepTransition;
