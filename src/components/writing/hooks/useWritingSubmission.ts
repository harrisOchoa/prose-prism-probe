
import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface UseWritingSubmissionProps {
  text: string;
  wordCount: number;
  currentQuestion: number;
  getAssessmentMetrics: () => any;
  onSubmit: (text: string, metrics?: any) => void;
  setIsSubmitting: (value: boolean) => void;
}

export const useWritingSubmission = ({
  text,
  wordCount,
  currentQuestion,
  getAssessmentMetrics,
  onSubmit,
  setIsSubmitting
}: UseWritingSubmissionProps) => {
  
  const handleSubmit = useCallback(async () => {
    if (wordCount < 50) {
      toast({
        title: "Response too short",
        description: "Please write at least 50 words to submit your assessment.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Getting assessment metrics before submission");
      const metrics = getAssessmentMetrics();
      console.log("Anti-cheating metrics captured:", metrics);
      
      // Create a copy to avoid modifying the original metrics
      const metricsToSubmit = {...metrics};
      
      // Force calculate words per minute based on text length and time
      if (metricsToSubmit && (!metricsToSubmit.wordsPerMinute || metricsToSubmit.wordsPerMinute === 0)) {
        const estimatedWPM = Math.max(1, Math.min(120, wordCount / (metricsToSubmit.timeSpentMs / 60000)));
        metricsToSubmit.wordsPerMinute = Math.round(estimatedWPM);
        console.log("Estimated WPM:", metricsToSubmit.wordsPerMinute);
      }
      
      // Add additional tracking metric for debugging
      localStorage.setItem(`prompt-${currentQuestion}-submitted`, "true");
      localStorage.setItem(`writing-metrics-captured`, JSON.stringify(metricsToSubmit));
      
      // Submit the response with metrics
      await onSubmit(text, metricsToSubmit);
    } catch (error) {
      console.error("Error capturing metrics during submission:", error);
      // If metrics capturing fails, still submit the response
      await onSubmit(text, null);
    } finally {
      setIsSubmitting(false);
    }
  }, [text, wordCount, currentQuestion, getAssessmentMetrics, onSubmit, setIsSubmitting]);

  return { handleSubmit };
};
