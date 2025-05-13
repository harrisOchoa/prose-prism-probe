
import React from "react";
import { Loader2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ANIMATION_TYPES } from "@/utils/animation";

export type AnalysisState = 'idle' | 'loading' | 'rate_limited' | 'error' | 'success';

interface AnalysisStateIndicatorProps {
  state: AnalysisState;
  message?: string;
  retryIn?: number;
  onRetry?: () => void;
  className?: string;
}

const AnalysisStateIndicator: React.FC<AnalysisStateIndicatorProps> = ({
  state,
  message,
  retryIn,
  onRetry,
  className
}) => {
  const getIndicator = () => {
    switch (state) {
      case 'loading':
        return (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              {message || "Processing..."}
            </span>
          </div>
        );
      
      case 'rate_limited':
        return (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-amber-500">
                {message || "Rate limit reached"}
              </span>
            </div>
            {retryIn && (
              <div className="text-xs text-muted-foreground">
                Retry available in {Math.ceil(retryIn / 1000)} seconds
              </div>
            )}
            {onRetry && (
              <button 
                onClick={onRetry}
                className="mt-2 px-3 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 rounded transition-colors disabled:opacity-50"
                disabled={retryIn && retryIn > 0}
              >
                Retry now
              </button>
            )}
          </div>
        );
      
      case 'error':
        return (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-500">
                {message || "An error occurred"}
              </span>
            </div>
            {onRetry && (
              <button 
                onClick={onRetry}
                className="mt-2 px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
              >
                Try again
              </button>
            )}
          </div>
        );
      
      case 'success':
        return (
          <div className="flex items-center space-x-2 animate-scale-in">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-500">
              {message || "Completed successfully"}
            </span>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (state === 'idle') return null;

  return (
    <div className={cn(
      "p-3 rounded-md transition-all duration-300",
      state === 'loading' && "bg-muted/30",
      state === 'rate_limited' && "bg-amber-50",
      state === 'error' && "bg-red-50",
      state === 'success' && "bg-green-50",
      ANIMATION_TYPES.fadeIn,
      className
    )}>
      {getIndicator()}
    </div>
  );
};

export default AnalysisStateIndicator;
