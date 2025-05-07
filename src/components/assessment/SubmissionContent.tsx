
import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnalysisStatus from "@/components/assessment/AnalysisStatus";
import SubmissionError from "@/components/assessment/SubmissionError";
import { AnalysisProgress } from "@/services/automaticAnalysis";

interface SubmissionContentProps {
  isSubmitting: boolean;
  isSubmitted: boolean;
  submissionError: string | null;
  analysisInProgress: boolean;
  analysisProgress: AnalysisProgress | null;
  onManualSubmit: () => void;
}

const SubmissionContent: React.FC<SubmissionContentProps> = ({
  isSubmitting,
  isSubmitted,
  submissionError,
  analysisInProgress,
  analysisProgress,
  onManualSubmit
}) => {
  if (submissionError) {
    return <SubmissionError 
      error={submissionError} 
      onRetry={onManualSubmit} 
      isRetrying={isSubmitting} 
    />;
  }
  
  if (isSubmitted) {
    return (
      <div className="text-center">
        <p className="text-gray-600">
          Your assessment has been successfully recorded. We appreciate your participation!
        </p>
        
        <AnalysisStatus 
          inProgress={analysisInProgress} 
          progress={analysisProgress} 
        />
      </div>
    );
  }
  
  if (isSubmitting) {
    return (
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p className="text-gray-600">
          Submitting your assessment... Please wait.
        </p>
      </div>
    );
  }
  
  return (
    <div className="text-center">
      <p className="text-yellow-600 mb-4">
        Your assessment hasn't been submitted yet. Please try submitting manually.
      </p>
      <Button 
        onClick={onManualSubmit}
        variant="default"
        className="min-w-[200px] mb-2"
      >
        Submit Assessment
      </Button>
    </div>
  );
};

export default SubmissionContent;
