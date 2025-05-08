
import { useEffect } from "react";

// Helper function to get a consistent submission ID key
export const getSubmissionKey = (candidateName: string, candidatePosition: string): string => {
  // Create a stable key that's consistent for the same candidate+position
  return `assessment-submitted-${candidateName.toLowerCase().trim()}-${candidatePosition.toLowerCase().trim()}`;
};

// Helper function to get a submission lock key
export const getSubmissionLockKey = (candidateName: string, candidatePosition: string): string => {
  return `assessment-lock-${candidateName.toLowerCase().trim()}-${candidatePosition.toLowerCase().trim()}`;
};

export const useSubmissionStorage = (
  candidateName: string,
  candidatePosition: string,
  setIsSubmitted: (value: boolean) => void,
  setAssessmentId: (value: string | null) => void
) => {
  // Check for previously submitted assessment on mount
  useEffect(() => {
    const localStorageKey = getSubmissionKey(candidateName, candidatePosition);
    const previouslySubmittedId = localStorage.getItem(localStorageKey);
    
    if (previouslySubmittedId) {
      console.log("Found previously submitted assessment:", previouslySubmittedId);
      setIsSubmitted(true);
      setAssessmentId(previouslySubmittedId);
    }
  }, [candidateName, candidatePosition, setIsSubmitted, setAssessmentId]);

  // Methods to save and check submission status
  const saveSubmissionToStorage = (assessmentId: string): void => {
    const localStorageKey = getSubmissionKey(candidateName, candidatePosition);
    localStorage.setItem(localStorageKey, assessmentId);
  };

  const checkExistingSubmission = (): string | null => {
    const localStorageKey = getSubmissionKey(candidateName, candidatePosition);
    return localStorage.getItem(localStorageKey);
  };
  
  const setSubmissionLock = (): void => {
    const sessionLockKey = getSubmissionLockKey(candidateName, candidatePosition);
    sessionStorage.setItem(sessionLockKey, Date.now().toString());
  };
  
  const clearSubmissionLock = (): void => {
    const sessionLockKey = getSubmissionLockKey(candidateName, candidatePosition);
    sessionStorage.removeItem(sessionLockKey);
  };
  
  const hasSubmissionLock = (): boolean => {
    const sessionLockKey = getSubmissionLockKey(candidateName, candidatePosition);
    return !!sessionStorage.getItem(sessionLockKey);
  };

  return {
    saveSubmissionToStorage,
    checkExistingSubmission,
    setSubmissionLock,
    clearSubmissionLock,
    hasSubmissionLock
  };
};
