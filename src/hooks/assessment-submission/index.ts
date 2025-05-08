
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { saveAssessmentResult } from "@/firebase/services/assessment/assessmentCreate";
import { WritingPromptItem } from "@/components/AssessmentManager";
import { AntiCheatingMetrics } from "@/firebase/services/assessment/types";

import { useSubmissionStorage } from "./useSubmissionStorage";
import { useMetricsSanitizer } from "./useMetricsSanitizer";
import { useAutoSubmit } from "./useAutoSubmit";
import { UseAssessmentSubmitReturn } from "./types";

export const useAssessmentSubmit = (
  candidateName: string,
  candidatePosition: string,
  completedPrompts: WritingPromptItem[],
  aptitudeScore: number,
  aptitudeTotal: number,
  antiCheatingMetrics?: AntiCheatingMetrics
): UseAssessmentSubmitReturn => {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionStartTime, setSubmissionStartTime] = useState<number | null>(null);
  const [submissionLock, setSubmissionLock] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Get helper hooks
  const { sanitizeAntiCheatingMetrics } = useMetricsSanitizer(completedPrompts);
  const { 
    saveSubmissionToStorage,
    checkExistingSubmission,
    setSubmissionLock: lockSession,
    clearSubmissionLock,
    hasSubmissionLock
  } = useSubmissionStorage(candidateName, candidatePosition, setIsSubmitted, setAssessmentId);

  // Check for existing submission immediately on mount
  useEffect(() => {
    if (candidateName && candidatePosition) {
      const existingId = checkExistingSubmission();
      if (existingId) {
        console.log("Found existing submission on mount:", existingId);
        setIsSubmitted(true);
        setAssessmentId(existingId);
      }
    }
  }, [candidateName, candidatePosition, checkExistingSubmission]);

  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log("Submission prevented - already in progress");
      return assessmentId || null;
    }
    
    // Only respect isSubmitted if we already have an assessmentId
    if (isSubmitted && assessmentId) {
      console.log("Submission prevented - already completed with ID", assessmentId);
      return assessmentId;
    }
    
    // Log submission attempt for debugging
    console.log("Starting submission attempt", {
      candidateName,
      candidatePosition,
      aptitudeScore,
      promptsCount: completedPrompts.length,
      hasMetrics: !!antiCheatingMetrics
    });
    
    // Set lock immediately to prevent parallel submissions
    setSubmissionLock(true);
    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionStartTime(Date.now());
    setRetryCount(prev => prev + 1);
    
    // Add a check to prevent creating a duplicate if we've already processed this assessment
    const previouslySubmittedId = checkExistingSubmission();
    
    if (previouslySubmittedId) {
      console.log("Using previously submitted assessment ID:", previouslySubmittedId);
      setIsSubmitted(true);
      setAssessmentId(previouslySubmittedId);
      setIsSubmitting(false);
      setSubmissionLock(false);
      return previouslySubmittedId;
    }
    
    // Additional session-based lock to prevent duplicate submissions
    if (hasSubmissionLock()) {
      console.log("Submission prevented by session lock");
      const existingId = checkExistingSubmission();
      if (existingId) {
        setIsSubmitted(true);
        setAssessmentId(existingId);
      }
      setIsSubmitting(false);
      setSubmissionLock(false);
      return existingId || null;
    }
    
    // Set the session lock
    lockSession();
    
    try {
      console.log("Submitting assessment with aptitude score:", aptitudeScore, "out of", aptitudeTotal);
      console.log("Candidate:", candidateName, "Position:", candidatePosition);
      const wordCount = completedPrompts.reduce((total, prompt) => total + prompt.wordCount, 0);
      console.log("Word count:", wordCount);
      console.log("Anti-cheating metrics present:", !!antiCheatingMetrics);
      console.log("Completed prompts count:", completedPrompts.length);
      console.log("Attempt number:", retryCount);
      
      // Validate inputs before submission
      if (!candidateName || !candidatePosition) {
        throw new Error("Missing candidate information for submission");
      }
      
      if (completedPrompts.length === 0) {
        throw new Error("No completed prompts available for submission");
      }
      
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
      saveSubmissionToStorage(id);
      
      return id;
    } catch (error: any) {
      console.error("Error submitting assessment:", error);
      const errorMessage = error?.message || "Unknown error occurred";
      
      setSubmissionError(errorMessage);
      
      // Provide more helpful error messages for common Firestore errors
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes("index")) {
        userFriendlyMessage = "The database needs an index to process your submission. Please notify the administrator or try again later.";
      } else if (errorMessage.includes("permission")) {
        userFriendlyMessage = "You don't have permission to submit assessments. Please check with the administrator.";
      }
      
      toast({
        title: "Submission Error",
        description: userFriendlyMessage,
        variant: "destructive",
      });

      // Clear session lock on error to allow retries
      clearSubmissionLock();
      return null;
    } finally {
      setIsSubmitting(false);
      setSubmissionStartTime(null);
      // Don't reset the submission lock here to prevent repeated auto-submissions
    }
  };

  // Auto-submit setup with improved debugging
  useAutoSubmit({
    submitAttempted,
    isSubmitted,
    submissionLock,
    submissionError,
    setSubmitAttempted,
    handleSubmit
  });

  return {
    isSubmitting,
    isSubmitted,
    assessmentId,
    submissionError,
    submissionStartTime,
    handleSubmit
  };
};

// Re-export the types
export * from "./types";
