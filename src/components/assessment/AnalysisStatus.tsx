
import React from "react";
import { Loader2, Brain } from "lucide-react";
import { AnalysisProgress } from "@/services/automaticAnalysis";

interface AnalysisStatusProps {
  inProgress: boolean;
  progress: AnalysisProgress | null;
}

const AnalysisStatus: React.FC<AnalysisStatusProps> = ({ inProgress, progress }) => {
  if (!inProgress && (!progress || progress.status !== 'completed')) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col items-center">
      {inProgress ? (
        <div className="flex items-center">
          <Loader2 className="h-5 w-5 mr-2 animate-spin text-indigo-500" />
          <p className="text-indigo-600">
            Analyzing your responses...
          </p>
        </div>
      ) : progress && progress.status === 'completed' ? (
        <div className="flex items-center">
          <Brain className="h-5 w-5 mr-2 text-green-500" />
          <p className="text-green-600">
            Analysis completed
          </p>
        </div>
      ) : null}
      
      {inProgress && (
        <p className="text-sm text-gray-500 mt-1">
          This may take a moment to complete in the background
        </p>
      )}
    </div>
  );
};

export default AnalysisStatus;
