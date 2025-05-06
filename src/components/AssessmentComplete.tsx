
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { saveAssessmentResult } from "@/firebase/services/assessment/assessmentCreate";
import { toast } from "@/components/ui/use-toast";
import { WritingPromptItem } from "./AssessmentManager";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { AntiCheatingMetrics } from "@/firebase/services/assessment/types";

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
  const [submissionStartTime, setSubmissionStartTime] = useState<number | null>(null);

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

  // Add a timeout to detect slow submissions
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isSubmitting && submissionStartTime) {
      timeoutId = setTimeout(() => {
        if (isSubmitting) {
          console.log("Submission is taking longer than expected");
          toast({
            title: "Submission is taking longer than expected",
            description: "We're still trying to save your assessment. Please wait a moment.",
          });
        }
      }, 5000); // Show message after 5 seconds
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSubmitting, submissionStartTime]);

  const sanitizeAntiCheatingMetrics = (metrics?: AntiCheatingMetrics): AntiCheatingMetrics | undefined => {
    if (!metrics) {
      console.log("No metrics to sanitize, creating a basic metrics object");
      return {
        keystrokes: 0,
        pauses: 0,
        tabSwitches: 0,
        windowBlurs: 0,
        windowFocuses: 0,
        copyAttempts: 0,
        pasteAttempts: 0,
        rightClickAttempts: 0,
        suspiciousActivity: false,
        wordsPerMinute: 0 // Add this property with a fallback to 0
      };
    }
    
    console.log("Original metrics:", metrics);
    
    // Create a sanitized copy with only primitive values and ensure wordsPerMinute exists
    return {
      keystrokes: metrics.keystrokes || 0,
      pauses: metrics.pauses || 0,
      tabSwitches: metrics.tabSwitches || 0,
      windowBlurs: metrics.windowBlurs || 0,
      windowFocuses: metrics.windowFocuses || 0,
      copyAttempts: metrics.copyAttempts || 0,
      pasteAttempts: metrics.pasteAttempts || 0,
      rightClickAttempts: metrics.rightClickAttempts || 0,
      suspiciousActivity: !!metrics.suspiciousActivity,
      wordsPerMinute: metrics.wordsPerMinute || Math.min(70, Math.max(10, completedPrompts.length > 0 ? wordCount / 5 : 0)) // Add this property with a fallback calculation
    };
  };

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) return;
    
    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionStartTime(Date.now());
    
    try {
      console.log("Submitting assessment with aptitude score:", aptitudeScore, "out of", aptitudeTotal);
      console.log("Candidate:", candidateName, "Position:", candidatePosition);
      console.log("Word count:", wordCount);
      console.log("Anti-cheating metrics present:", !!antiCheatingMetrics);
      console.log("Completed prompts count:", completedPrompts.length);
      
      // Sanitize the anti-cheating metrics to ensure they're Firestore-compatible
      const sanitizedMetrics = sanitizeAntiCheatingMetrics(antiCheatingMetrics);
      console.log("Sanitized metrics:", sanitizedMetrics);
      
      const id = await saveAssessmentResult(
        candidateName,
        candidatePosition,
        completedPrompts,
        aptitudeScore,
        aptitudeTotal,
        undefined, // No writing scores at this stage
        sanitizedMetrics
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
      setSubmissionStartTime(null);
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  "Retry Submission"
                )}
              </Button>
            </div>
          ) : isSubmitted ? (
            <p className="text-center text-gray-600">
              Your assessment has been successfully recorded. We appreciate your participation!
            </p>
          ) : isSubmitting ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">
                Submitting your assessment... Please wait.
              </p>
            </div>
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
