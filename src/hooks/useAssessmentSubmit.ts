
import { useState, useEffect } from "react";
import { saveAssessmentResult } from "@/firebase/services/assessment/assessmentCreate";
import { toast } from "@/components/ui/use-toast";
import { WritingPromptItem } from "@/components/AssessmentManager";
import { AntiCheatingMetrics } from "@/firebase/services/assessment/types";

export const useAssessmentSubmit = (
  candidateName: string,
  candidatePosition: string,
  completedPrompts: WritingPromptItem[],
  aptitudeScore: number,
  aptitudeTotal: number,
  antiCheatingMetrics?: AntiCheatingMetrics
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionStartTime, setSubmissionStartTime] = useState<number | null>(null);
  const [submissionLock, setSubmissionLock] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // Add retry count tracking

  // Generate a consistent submission ID key
  const getSubmissionKey = () => {
    // Create a stable key that's consistent for the same candidate+position
    return `assessment-submitted-${candidateName.toLowerCase().trim()}-${candidatePosition.toLowerCase().trim()}`;
  };

  // Check for previously submitted assessment
  useEffect(() => {
    const localStorageKey = getSubmissionKey();
    const previouslySubmittedId = localStorage.getItem(localStorageKey);
    
    if (previouslySubmittedId) {
      console.log("Found previously submitted assessment:", previouslySubmittedId);
      setIsSubmitted(true);
      setAssessmentId(previouslySubmittedId);
    }
  }, [candidateName, candidatePosition]);

  // Auto-submit when component mounts if not already submitted
  useEffect(() => {
    // Only auto-submit if no error, no prior submission, and not already attempting a submission
    if (!submitAttempted && !isSubmitted && !submissionLock && !submissionError) {
      console.log("Attempting to auto-submit assessment...");
      setSubmitAttempted(true);
      handleSubmit();
    }
  }, [isSubmitted, submissionLock, submissionError]);

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
        wordsPerMinute: 0
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
      wordsPerMinute: metrics.wordsPerMinute || Math.min(70, Math.max(10, completedPrompts.length > 0 ? 
        completedPrompts.reduce((total, prompt) => total + prompt.wordCount, 0) / 5 : 0))
    };
  };

  const handleSubmit = async () => {
    // ENHANCED: Multiple guards against duplicate submission
    if (isSubmitting) {
      console.log("Submission prevented - already in progress");
      return assessmentId || null;
    }
    
    // Only respect isSubmitted if we already have an assessmentId
    if (isSubmitted && assessmentId) {
      console.log("Submission prevented - already completed with ID", assessmentId);
      return assessmentId;
    }
    
    // Set lock immediately to prevent parallel submissions
    setSubmissionLock(true);
    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionStartTime(Date.now());
    setRetryCount(prev => prev + 1);
    
    // Add a check to prevent creating a duplicate if we've already processed this assessment
    const localStorageKey = getSubmissionKey();
    const previouslySubmittedId = localStorage.getItem(localStorageKey);
    
    if (previouslySubmittedId) {
      console.log("Using previously submitted assessment ID:", previouslySubmittedId);
      setIsSubmitted(true);
      setAssessmentId(previouslySubmittedId);
      setIsSubmitting(false);
      setSubmissionLock(false);
      return previouslySubmittedId;
    }
    
    // Additional session-based lock to prevent duplicate submissions
    const sessionLockKey = `assessment-lock-${candidateName.toLowerCase().trim()}-${candidatePosition.toLowerCase().trim()}`;
    if (sessionStorage.getItem(sessionLockKey)) {
      console.log("Submission prevented by session lock");
      const existingId = localStorage.getItem(localStorageKey);
      if (existingId) {
        setIsSubmitted(true);
        setAssessmentId(existingId);
      }
      setIsSubmitting(false);
      setSubmissionLock(false);
      return existingId || null;
    }
    
    // Set the session lock
    sessionStorage.setItem(sessionLockKey, Date.now().toString());
    
    try {
      console.log("Submitting assessment with aptitude score:", aptitudeScore, "out of", aptitudeTotal);
      console.log("Candidate:", candidateName, "Position:", candidatePosition);
      const wordCount = completedPrompts.reduce((total, prompt) => total + prompt.wordCount, 0);
      console.log("Word count:", wordCount);
      console.log("Anti-cheating metrics present:", !!antiCheatingMetrics);
      console.log("Completed prompts count:", completedPrompts.length);
      console.log("Attempt number:", retryCount);
      
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
      localStorage.setItem(localStorageKey, id);
      
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
      sessionStorage.removeItem(sessionLockKey);
      return null;
    } finally {
      setIsSubmitting(false);
      setSubmissionStartTime(null);
      // Don't reset the submission lock to allow for manual retries
    }
  };

  return {
    isSubmitting,
    isSubmitted,
    assessmentId,
    submissionError,
    submissionStartTime,
    handleSubmit
  };
};
