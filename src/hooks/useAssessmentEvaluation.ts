
import { useState, useCallback } from "react";
import { useSimplifiedUnifiedAnalysis } from "./assessment/useSimplifiedUnifiedAnalysis";
import { useAdvancedAnalysis } from "./assessment/useAdvancedAnalysis";
import { toast } from "@/hooks/use-toast";
import { AssessmentData } from "@/types/assessment";

/**
 * Main hook for assessment evaluation using the simplified unified analysis system
 */
export const useAssessmentEvaluation = (assessmentData: any, setAssessmentData: (data: any) => void) => {
  const [rateLimitInfo, setRateLimitInfo] = useState({
    isRateLimited: false,
    retryAttempt: 0,
    maxRetries: 3,
    nextRetryTime: 0
  });

  // Use the simplified unified analysis system
  const {
    analysisInProgress,
    evaluating,
    generatingSummary,
    startAnalysis,
    generateInsightsOnly,
    canStartAnalysis,
    resetAnalysisState
  } = useSimplifiedUnifiedAnalysis(assessmentData?.id);

  const {
    generatingAnalysis,
    generateAdvancedAnalysis
  } = useAdvancedAnalysis(assessmentData, setAssessmentData);

  // Enhanced manual evaluation with unified system
  const handleManualEvaluation = useCallback(async () => {
    if (!assessmentData || !assessmentData.id) {
      toast({
        title: "Missing Assessment",
        description: "No assessment data available.",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting manual evaluation for:", assessmentData.id);
    
    const result = await startAnalysis(assessmentData.id, assessmentData);
    
    if (result) {
      // Refresh assessment data after successful analysis
      toast({
        title: "Evaluation Complete",
        description: "Assessment has been successfully evaluated.",
      });
      
      // You might want to refresh the assessment data here
      // This would depend on your data fetching setup
    }
  }, [assessmentData, startAnalysis]);

  // Enhanced regenerate insights with unified system
  const regenerateInsights = useCallback(async () => {
    if (!assessmentData || !assessmentData.id) {
      toast({
        title: "Missing Assessment",
        description: "No assessment data available.",
        variant: "destructive",
      });
      return null;
    }

    console.log("Regenerating insights for:", assessmentData.id);
    
    const result = await generateInsightsOnly(assessmentData.id, assessmentData);
    
    if (result) {
      toast({
        title: "Insights Regenerated",
        description: "Assessment insights have been successfully regenerated.",
      });
    }
    
    return result;
  }, [assessmentData, generateInsightsOnly]);

  return {
    // Unified analysis interface
    analysisInProgress,
    evaluating,
    generatingSummary,
    generatingAnalysis,
    canStartAnalysis,
    
    // Actions
    handleManualEvaluation,
    regenerateInsights,
    generateAdvancedAnalysis,
    resetAnalysisState,
    
    // Legacy support
    rateLimitInfo,
    setGeneratingSummary: () => {} // No-op for backward compatibility
  };
};
