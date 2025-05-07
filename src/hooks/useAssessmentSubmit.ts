
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

  // Check for previously submitted assessment
  useEffect(() => {
    const localStorageKey = `assessment-submitted-${candidateName}-${candidatePosition}`;
    const previouslySubmittedId = localStorage.getItem(localStorageKey);
    
    if (previouslySubmittedId) {
      console.log("Found previously submitted assessment:", previouslySubmittedId);
      setIsSubmitted(true);
      setAssessmentId(previouslySubmittedId);
    }
  }, [candidateName, candidatePosition]);

  // Auto-submit when component mounts if not already submitted
  useEffect(() => {
    if (!submitAttempted && !isSubmitted) {
      console.log("Attempting to auto-submit assessment...");
      setSubmitAttempted(true);
      handleSubmit();
    }
  }, [isSubmitted]);

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
    if (isSubmitting || isSubmitted) return;
    
    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionStartTime(Date.now());
    
    // Add a check to prevent creating a duplicate if we've already processed this assessment
    const localStorageKey = `assessment-submitted-${candidateName}-${candidatePosition}`;
    const previouslySubmittedId = localStorage.getItem(localStorageKey);
    
    if (previouslySubmittedId) {
      console.log("Using previously submitted assessment ID:", previouslySubmittedId);
      setIsSubmitted(true);
      setAssessmentId(previouslySubmittedId);
      setIsSubmitting(false);
      return previouslySubmittedId;
    }
    
    try {
      console.log("Submitting assessment with aptitude score:", aptitudeScore, "out of", aptitudeTotal);
      console.log("Candidate:", candidateName, "Position:", candidatePosition);
      const wordCount = completedPrompts.reduce((total, prompt) => total + prompt.wordCount, 0);
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
      localStorage.setItem(localStorageKey, id);
      
      return id;
    } catch (error: any) {
      console.error("Error submitting assessment:", error);
      setSubmissionError(error?.message || "Unknown error occurred");
      
      toast({
        title: "Submission Error",
        description: "There was an error submitting your assessment. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSubmitting(false);
      setSubmissionStartTime(null);
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
