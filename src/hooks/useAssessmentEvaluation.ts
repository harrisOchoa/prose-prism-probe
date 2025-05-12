
import { useState, useCallback } from "react";
import { useWritingEvaluation } from "./assessment/useWritingEvaluation";
import { useAdvancedAnalysis } from "./assessment/useAdvancedAnalysis";
import { toast } from "@/hooks/use-toast";
import { AssessmentData } from "@/types/assessment";

/**
 * Main hook for assessment evaluation that combines writing evaluation and advanced analysis
 */
export const useAssessmentEvaluation = (assessmentData: any, setAssessmentData: (data: any) => void) => {
  // Track rate limit information at the top level
  const [rateLimitInfo, setRateLimitInfo] = useState({
    isRateLimited: false,
    retryAttempt: 0,
    maxRetries: 3,
    nextRetryTime: 0
  });

  // Initialize sub-hooks
  const {
    evaluating,
    generatingSummary,
    handleManualEvaluation,
    regenerateInsights,
    setGeneratingSummary
  } = useWritingEvaluation(assessmentData, setAssessmentData);

  const {
    generatingAnalysis,
    generateAdvancedAnalysis
  } = useAdvancedAnalysis(assessmentData, setAssessmentData);

  // Enhanced regenerate insights with improved rate limit handling
  const handleRegenerateWithRetry = useCallback(async () => {
    // Reset rate limit state
    setRateLimitInfo({
      isRateLimited: false,
      retryAttempt: 0,
      maxRetries: 3,
      nextRetryTime: 0
    });
    
    // Show toast notification
    toast({
      title: "Regenerating Insights",
      description: "Manual regeneration initiated. This may take a moment.",
    });
    
    try {
      const result = await regenerateInsights();
      
      // If successful and result is truthy, show success toast
      if (result) {
        toast({
          title: "Regeneration Complete",
          description: "Insights have been successfully regenerated.",
        });
        return result;
      }
      
      // Otherwise, check if we have rate limiting in the assessment data
      if (assessmentData.analysisStatus === 'rate_limited' || 
          (assessmentData.analysisError && 
           assessmentData.analysisError.toLowerCase().includes('rate limit'))) {
        
        setRateLimitInfo(prev => ({
          isRateLimited: true,
          retryAttempt: prev.retryAttempt + 1,
          maxRetries: 3,
          nextRetryTime: Date.now() + ((prev.retryAttempt + 1) * 5000)
        }));
        
        toast({
          title: "Rate Limit Detected",
          description: "The analysis will retry automatically when the rate limit clears.",
          duration: 8000,
        });
      }
      
      return null;
    } catch (error: any) {
      console.error("Error in handleRegenerateWithRetry:", error);
      
      // Check for rate limit errors
      if (error.message && error.message.toLowerCase().includes('rate limit')) {
        setRateLimitInfo(prev => ({
          isRateLimited: true,
          retryAttempt: prev.retryAttempt + 1,
          maxRetries: 3,
          nextRetryTime: Date.now() + ((prev.retryAttempt + 1) * 5000)
        }));
        
        toast({
          title: "Rate Limit Error",
          description: "API rate limit reached. Please wait before trying again.",
          variant: "destructive",
          duration: 8000,
        });
      } else {
        toast({
          title: "Regeneration Failed",
          description: error.message || "Unknown error occurred",
          variant: "destructive",
        });
      }
      
      return null;
    }
  }, [assessmentData, regenerateInsights]);

  // Return a combined API for the components to use
  return {
    evaluating,
    generatingSummary,
    generatingAnalysis,
    handleManualEvaluation,
    regenerateInsights: handleRegenerateWithRetry,
    generateAdvancedAnalysis,
    setGeneratingSummary,
    rateLimitInfo
  };
};
