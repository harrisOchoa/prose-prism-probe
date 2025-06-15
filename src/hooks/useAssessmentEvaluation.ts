
import { useState, useCallback } from "react";
import { useWritingEvaluation } from "./assessment/useWritingEvaluation";
import { useAdvancedAnalysis } from "./assessment/useAdvancedAnalysis";
import { useUnifiedAnalysis } from "./assessment/useUnifiedAnalysis";
import { toast } from "@/hooks/use-toast";
import { AssessmentData } from "@/types/assessment";

/**
 * Main hook for assessment evaluation using the unified analysis system
 */
export const useAssessmentEvaluation = (assessmentData: any, setAssessmentData: (data: any) => void) => {
  const [rateLimitInfo, setRateLimitInfo] = useState({
    isRateLimited: false,
    retryAttempt: 0,
    maxRetries: 3,
    nextRetryTime: 0
  });

  // Use the unified analysis system
  const {
    analysisInProgress,
    evaluating,
    generatingSummary,
    startAnalysis,
    evaluateWritingOnly,
    generateInsightsOnly
  } = useUnifiedAnalysis();

  // Legacy support for older analysis hooks
  const {
    handleManualEvaluation,
    regenerateInsights,
    setGeneratingSummary
  } = useWritingEvaluation(assessmentData, setAssessmentData);

  const {
    generatingAnalysis,
    generateAdvancedAnalysis
  } = useAdvancedAnalysis(assessmentData, setAssessmentData);

  // Enhanced regenerate insights with unified system
  const handleRegenerateWithRetry = useCallback(async () => {
    setRateLimitInfo({
      isRateLimited: false,
      retryAttempt: 0,
      maxRetries: 3,
      nextRetryTime: 0
    });
    
    toast({
      title: "Regenerating Insights",
      description: "Using unified analysis system for faster results.",
    });
    
    try {
      const result = await startAnalysis(assessmentData.id, assessmentData, 'high');
      
      if (result) {
        toast({
          title: "Regeneration Complete",
          description: "Insights have been successfully regenerated.",
        });
        return result;
      }
      
      // Fallback to legacy system if needed
      return await regenerateInsights();
    } catch (error: any) {
      console.error("Error in handleRegenerateWithRetry:", error);
      
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
  }, [assessmentData, startAnalysis, regenerateInsights]);

  return {
    // Unified analysis interface
    analysisInProgress,
    evaluating,
    generatingSummary,
    generatingAnalysis,
    
    // Actions
    handleManualEvaluation,
    regenerateInsights: handleRegenerateWithRetry,
    generateAdvancedAnalysis,
    setGeneratingSummary,
    
    // Legacy support
    rateLimitInfo
  };
};
