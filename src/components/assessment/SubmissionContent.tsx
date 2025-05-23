
import React, { useEffect } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubmissionError from "@/components/assessment/SubmissionError";
import { AnalysisProgress } from "@/services/automaticAnalysis";

interface SubmissionContentProps {
  isSubmitting: boolean;
  isSubmitted: boolean;
  submissionError: string | null;
  analysisInProgress: boolean;
  analysisProgress: AnalysisProgress | null;
  onManualSubmit: () => void;
  showAnalysisStatus?: boolean;
}

const SubmissionContent: React.FC<SubmissionContentProps> = ({
  isSubmitting,
  isSubmitted,
  submissionError,
  analysisInProgress,
  analysisProgress,
  onManualSubmit,
  showAnalysisStatus = false
}) => {
  // Log state changes for debugging
  useEffect(() => {
    console.log("SubmissionContent state:", {
      isSubmitting,
      isSubmitted,
      hasError: !!submissionError,
      analysisInProgress
    });
  }, [isSubmitting, isSubmitted, submissionError, analysisInProgress]);

  // Handle submission in progress state
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
  
  // Handle successful submission state
  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <CheckCircle className="text-green-500 h-6 w-6" />
        </div>
        <p className="text-gray-600">
          Your assessment has been successfully recorded. We appreciate your participation!
        </p>
        
        {/* Only show analysis status if explicitly enabled */}
        {showAnalysisStatus && analysisInProgress && (
          <div className="mt-4 text-indigo-600">
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
            Analyzing your responses...
            <p className="text-sm text-gray-500 mt-1">
              This may take a moment to complete in the background
            </p>
          </div>
        )}
      </div>
    );
  }
  
  // Handle error state - only show after submission attempts have been made
  if (submissionError) {
    return <SubmissionError 
      error={submissionError} 
      onRetry={onManualSubmit} 
      isRetrying={isSubmitting} 
    />;
  }
  
  // Default state - need to submit (should rarely be seen due to auto-submit)
  return (
    <div className="text-center">
      <p className="text-yellow-600 mb-4">
        We're processing your assessment. If it doesn't complete automatically, please click below.
      </p>
      <Button 
        onClick={onManualSubmit}
        variant="default"
        className="min-w-[200px] mb-2"
      >
        Complete Assessment
      </Button>
    </div>
  );
};

export default SubmissionContent;
