
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
    // Only auto-submit if no error, no prior submission, and not already attempting a submission
    if (!submitAttempted && !isSubmitted && !submissionLock && !submissionError) {
      console.log("Attempting to auto-submit assessment...");
      setSubmitAttempted(true);
      handleSubmit();
    }
  }, [isSubmitted, submissionLock, submissionError, submitAttempted, setSubmitAttempted, handleSubmit]);
};
