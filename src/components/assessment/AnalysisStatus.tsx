
import React from "react";
import { Loader2, Brain, AlertTriangle } from "lucide-react";
import { AnalysisProgress } from "@/services/automaticAnalysis";
import { ANIMATION_TYPES, getAnimationForState } from "@/utils/animation";
import { cn } from "@/lib/utils";

interface AnalysisStatusProps {
  inProgress: boolean;
  progress: AnalysisProgress | null;
  visible?: boolean; 
  rateLimited?: boolean;
  error?: string | null;
  className?: string;
}

const AnalysisStatus: React.FC<AnalysisStatusProps> = ({ 
  inProgress, 
  progress,
  visible = false,
  rateLimited = false,
  error = null,
  className
}) => {
  // If not visible, don't render anything
  if (!visible) {
    return null;
  }

  // Determine display state for the component
  let icon;
  let message;
  let description;
  let stateClass;

  if (error) {
    icon = <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />;
    message = <p className="text-red-600">Analysis Error</p>;
    description = <p className="text-sm text-gray-500 mt-1">{error}</p>;
    stateClass = getAnimationForState('error');
  } else if (rateLimited) {
    icon = <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />;
    message = <p className="text-amber-600">API Rate Limited</p>;
    description = <p className="text-sm text-gray-500 mt-1">Please wait before trying again</p>;
    stateClass = getAnimationForState('rate_limited');
  } else if (inProgress) {
    icon = <Loader2 className="h-5 w-5 mr-2 animate-spin text-indigo-500" />;
    message = <p className="text-indigo-600">Analyzing your responses...</p>;
    description = <p className="text-sm text-gray-500 mt-1">This may take a moment to complete in the background</p>;
    stateClass = getAnimationForState('loading');
  } else if (progress && progress.status === 'completed') {
    icon = <Brain className="h-5 w-5 mr-2 text-green-500" />;
    message = <p className="text-green-600">Analysis completed</p>;
    description = null;
    stateClass = getAnimationForState('success');
  } else {
    return null; // No state to display
  }

  return (
    <div className={cn(
      "mt-4 flex flex-col items-center",
      ANIMATION_TYPES.fadeIn,
      stateClass,
      className
    )}>
      <div className="flex items-center">
        {icon}
        {message}
      </div>
      {description}
    </div>
  );
};

export default AnalysisStatus;
