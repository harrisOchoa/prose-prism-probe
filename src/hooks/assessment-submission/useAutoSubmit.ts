
import { useEffect } from "react";

interface AutoSubmitProps {
  submitAttempted: boolean;
  isSubmitted: boolean;
  submissionLock: boolean;
  submissionError: string | null;
  setSubmitAttempted: (value: boolean) => void;
  handleSubmit: () => Promise<string | null>;
}

export const useAutoSubmit = ({
  submitAttempted,
  isSubmitted,
  submissionLock,
  submissionError,
  setSubmitAttempted,
  handleSubmit
}: AutoSubmitProps) => {
  // Auto-submit when component mounts if not already submitted
  useEffect(() => {
    // Only run this effect once and after a small delay to ensure all state is ready
    const timer = setTimeout(() => {
      // Only auto-submit if no error, no prior submission, and not already attempting a submission
      if (!submitAttempted && !isSubmitted && !submissionLock && !submissionError) {
        console.log("Auto-submission triggered - starting assessment submission");
        setSubmitAttempted(true);
        handleSubmit()
          .then(id => {
            if (id) {
              console.log("Auto-submission successful with ID:", id);
            } else {
              console.warn("Auto-submission completed but no ID returned");
            }
          })
          .catch(error => {
            console.error("Auto-submit failed:", error);
          });
      } else {
        console.log("Auto-submission skipped due to conditions:", {
          submitAttempted,
          isSubmitted,
          submissionLock,
          hasError: !!submissionError
        });
      }
    }, 500); // Reduced delay for faster reaction
    
    return () => clearTimeout(timer);
  }, [isSubmitted, submissionLock, submissionError, submitAttempted, setSubmitAttempted, handleSubmit]);
};
