
import { WritingPromptItem } from "@/components/AssessmentManager";
import { AntiCheatingMetrics } from "@/firebase/services/assessment/types";

export interface AssessmentSubmissionState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  assessmentId: string | null;
  submissionError: string | null;
  submissionStartTime: number | null;
  submissionLock: boolean;
  retryCount: number;
}

export interface UseAssessmentSubmitReturn {
  isSubmitting: boolean;
  isSubmitted: boolean;
  assessmentId: string | null;
  submissionError: string | null;
  submissionStartTime: number | null;
  handleSubmit: () => Promise<string | null>;
}
