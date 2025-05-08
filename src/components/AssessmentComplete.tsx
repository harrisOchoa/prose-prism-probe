
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { WritingPromptItem } from "./AssessmentManager";
import { AntiCheatingMetrics } from "@/firebase/services/assessment/types";
import { useAssessmentSubmit } from "@/hooks/assessment-submission";
import { useAssessmentAnalysis } from "@/hooks/useAssessmentAnalysis";
import SubmissionContent from "@/components/assessment/SubmissionContent";
import { AssessmentData } from "@/types/assessment";

interface AssessmentCompleteProps {
  candidateName: string;
  candidatePosition: string;
  completedPrompts: WritingPromptItem[];
  aptitudeScore: number;
  aptitudeTotal: number;
  restartAssessment: () => void;
  antiCheatingMetrics?: AntiCheatingMetrics;
  wordCount: number;
}

const AssessmentComplete = ({
  candidateName,
  candidatePosition,
  completedPrompts,
  aptitudeScore,
  aptitudeTotal,
  restartAssessment,
  antiCheatingMetrics,
  wordCount
}: AssessmentCompleteProps) => {
  // Use the extracted hooks for submission and analysis logic
  const {
    isSubmitting,
    isSubmitted,
    assessmentId,
    submissionError,
    handleSubmit
  } = useAssessmentSubmit(
    candidateName,
    candidatePosition,
    completedPrompts,
    aptitudeScore,
    aptitudeTotal,
    antiCheatingMetrics
  );

  const {
    analysisInProgress,
    analysisProgress,
    startAutomaticAnalysis
  } = useAssessmentAnalysis();

  // Log component rendering for debugging
  useEffect(() => {
    console.log("AssessmentComplete rendered:", {
      candidateName,
      candidatePosition,
      promptsCount: completedPrompts.length,
      aptitudeScore,
      aptitudeTotal,
      hasMetrics: !!antiCheatingMetrics,
      isSubmitting,
      isSubmitted,
      assessmentId,
      submissionError
    });
  }, [
    candidateName, 
    candidatePosition, 
    completedPrompts.length, 
    aptitudeScore, 
    aptitudeTotal, 
    antiCheatingMetrics, 
    isSubmitting, 
    isSubmitted, 
    assessmentId, 
    submissionError
  ]);

  // Start analysis after successful submission
  useEffect(() => {
    if (isSubmitted && assessmentId && completedPrompts.length > 0) {
      console.log("Starting automatic analysis for assessment:", assessmentId);
      
      // Create assessment data object for analysis
      const assessmentData: AssessmentData = {
        id: assessmentId,
        candidateName,
        candidatePosition,
        completedPrompts,
        aptitudeScore,
        aptitudeTotal,
        wordCount,
        submittedAt: new Date() // Adding the required submittedAt property
      };
      
      startAutomaticAnalysis(assessmentId, assessmentData);
    }
  }, [isSubmitted, assessmentId, completedPrompts, candidateName, candidatePosition, aptitudeScore, aptitudeTotal, wordCount, startAutomaticAnalysis]);

  // Manually trigger submission once on mount if not already submitted
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSubmitting && !isSubmitted && !submissionError) {
        console.log("AssessmentComplete: Triggering manual submission on mount");
        handleSubmit();
      }
    }, 1000); // Shorter delay for more responsive experience
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="assessment-card max-w-4xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className={`rounded-full p-3 ${isSubmitted ? 'bg-green-100' : submissionError ? 'bg-red-100' : 'bg-yellow-100'}`}>
          {isSubmitted ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : submissionError ? (
            <AlertCircle className="h-12 w-12 text-red-500" />
          ) : (
            <AlertCircle className="h-12 w-12 text-yellow-500" />
          )}
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {isSubmitted ? "Assessment Complete" : "Completing Assessment"}
        </h1>
        <p className="text-lg text-gray-600">
          {isSubmitted 
            ? `Thank you for completing the assessment, ${candidateName}!`
            : `We're finalizing your assessment, ${candidateName}...`
          }
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <SubmissionContent
            isSubmitting={isSubmitting}
            isSubmitted={isSubmitted}
            submissionError={submissionError}
            analysisInProgress={analysisInProgress}
            analysisProgress={analysisProgress}
            onManualSubmit={handleSubmit}
            showAnalysisStatus={false} // Set to false to hide analysis status
          />
        </CardContent>
      </Card>

      {isSubmitted && (
        <div className="flex justify-center">
          <Button 
            onClick={restartAssessment}
            variant="outline"
            className="min-w-[200px]"
          >
            Start New Assessment
          </Button>
        </div>
      )}

      {assessmentId && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">Assessment ID: {assessmentId}</p>
        </div>
      )}
    </div>
  );
};

export default AssessmentComplete;
