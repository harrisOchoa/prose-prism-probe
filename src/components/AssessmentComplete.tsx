
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { saveAssessmentResult } from "@/firebase/services/assessment";
import { toast } from "@/components/ui/use-toast";
import { WritingPromptItem } from "./AssessmentManager";
import { CheckCircle, AlertCircle } from "lucide-react";
import { AntiCheatingMetrics } from "@/firebase/services/assessment";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Check if we've previously submitted this assessment
  useEffect(() => {
    const localStorageKey = `assessment-submitted-${candidateName}-${candidatePosition}`;
    const previouslySubmittedId = localStorage.getItem(localStorageKey);
    
    if (previouslySubmittedId) {
      console.log("Found previously submitted assessment:", previouslySubmittedId);
      setIsSubmitted(true);
      setAssessmentId(previouslySubmittedId);
    }
  }, [candidateName, candidatePosition]);

  // Auto-submit the assessment when component mounts, but only once and only if not previously submitted
  useEffect(() => {
    if (!submitAttempted && !isSubmitted) {
      console.log("Attempting to auto-submit assessment...");
      setSubmitAttempted(true);
      handleSubmit();
    }
  }, [isSubmitted]);

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) return;
    
    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      console.log("Submitting assessment with aptitude score:", aptitudeScore, "out of", aptitudeTotal);
      console.log("Candidate:", candidateName, "Position:", candidatePosition);
      console.log("Word count:", wordCount);
      console.log("Anti-cheating metrics present:", !!antiCheatingMetrics);
      console.log("Completed prompts count:", completedPrompts.length);
      
      const id = await saveAssessmentResult(
        candidateName,
        candidatePosition,
        completedPrompts,
        aptitudeScore,
        aptitudeTotal,
        undefined, // No writing scores at this stage
        antiCheatingMetrics
      );
      
      console.log("Assessment successfully submitted with ID:", id);
      setAssessmentId(id);
      setIsSubmitted(true);
      
      toast({
        title: "Assessment Submitted",
        description: "Your assessment has been successfully submitted.",
      });
      
      // Save the submission ID to localStorage to prevent duplicate submissions
      localStorage.setItem(`assessment-submitted-${candidateName}-${candidatePosition}`, id);
      
    } catch (error: any) {
      console.error("Error submitting assessment:", error);
      setSubmissionError(error?.message || "Unknown error occurred");
      
      toast({
        title: "Submission Error",
        description: "There was an error submitting your assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Manual retry option if auto-submission failed
  const handleManualSubmit = () => {
    if (!isSubmitted) {
      handleSubmit();
    }
  };

  return (
    <div className="assessment-card max-w-4xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className={`rounded-full p-3 ${isSubmitted ? 'bg-green-100' : submissionError ? 'bg-red-100' : 'bg-green-100'}`}>
          {isSubmitted ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : submissionError ? (
            <AlertCircle className="h-12 w-12 text-red-500" />
          ) : (
            <CheckCircle className="h-12 w-12 text-green-500" />
          )}
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Assessment Complete</h1>
        <p className="text-lg text-gray-600">
          Thank you for completing the assessment, {candidateName}!
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          {submissionError ? (
            <div className="text-center">
              <p className="text-red-600 mb-4">
                There was an error submitting your assessment: {submissionError}
              </p>
              <Button 
                onClick={handleManualSubmit}
                variant="default"
                className="min-w-[200px] mb-2"
                disabled={isSubmitting}
              >
                Retry Submission
              </Button>
            </div>
          ) : isSubmitted ? (
            <p className="text-center text-gray-600">
              Your assessment has been successfully recorded. We appreciate your participation!
            </p>
          ) : isSubmitting ? (
            <p className="text-center text-gray-600">
              Submitting your assessment... Please wait.
            </p>
          ) : (
            <div className="text-center">
              <p className="text-yellow-600 mb-4">
                Your assessment hasn't been submitted yet. Please try submitting manually.
              </p>
              <Button 
                onClick={handleManualSubmit}
                variant="default"
                className="min-w-[200px] mb-2"
              >
                Submit Assessment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          onClick={restartAssessment}
          variant="outline"
          className="min-w-[200px]"
        >
          Start New Assessment
        </Button>
      </div>

      {assessmentId && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">Assessment ID: {assessmentId}</p>
        </div>
      )}
    </div>
  );
};

export default AssessmentComplete;
