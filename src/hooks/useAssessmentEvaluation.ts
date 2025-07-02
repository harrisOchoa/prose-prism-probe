
import { useState, useCallback, useMemo } from "react";
import { useSimplifiedUnifiedAnalysis } from "./assessment/useSimplifiedUnifiedAnalysis";
import { useAdvancedAnalysis } from "./assessment/advanced-analysis/useAdvancedAnalysis";
import { toast } from "@/hooks/use-toast";
import { AssessmentData } from "@/types/assessment";
import { logger } from "@/services/logging";

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
    resetAnalysisState,
    forceStopAnalysis
  } = useSimplifiedUnifiedAnalysis(assessmentData?.id);

  const {
    generatingAnalysis,
    generateAdvancedAnalysis
  } = useAdvancedAnalysis(assessmentData, setAssessmentData);

  // Enhanced manual evaluation with unified system and proper logging
  const handleManualEvaluation = useCallback(async () => {
    if (!assessmentData || !assessmentData.id) {
      logger.warn('EVALUATION', 'Manual evaluation attempted without assessment data');
      toast({
        title: "Missing Assessment",
        description: "No assessment data available.",
        variant: "destructive",
      });
      return;
    }

    logger.info('EVALUATION', 'Starting manual evaluation', { assessmentId: assessmentData.id });
    
    const result = await startAnalysis(assessmentData.id, assessmentData);
    
    if (result) {
      logger.info('EVALUATION', 'Manual evaluation completed successfully', { assessmentId: assessmentData.id });
      toast({
        title: "Evaluation Complete",
        description: "Assessment has been successfully evaluated.",
      });
    } else {
      logger.error('EVALUATION', 'Manual evaluation failed', { assessmentId: assessmentData.id });
    }
  }, [assessmentData, startAnalysis]);

  // Enhanced regenerate insights with unified system and proper logging
  const regenerateInsights = useCallback(async () => {
    if (!assessmentData || !assessmentData.id) {
      logger.error('EVALUATION', 'Cannot regenerate insights: missing assessment data or ID');
      toast({
        title: "Missing Assessment",
        description: "No assessment data available.",
        variant: "destructive",
      });
      return null;
    }

    logger.info('EVALUATION', 'Regenerating insights', {
      assessmentId: assessmentData.id,
      hasWritingScores: !!assessmentData.writingScores,
      writingScoresLength: assessmentData.writingScores?.length || 0,
      canStart: canStartAnalysis
    });
    
    // Check if analysis can start
    if (!canStartAnalysis) {
      logger.warn('EVALUATION', 'Analysis blocked - canStartAnalysis is false');
      toast({
        title: "Analysis Blocked",
        description: "Analysis is currently blocked. Please wait or try the emergency reset.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      const result = await generateInsightsOnly(assessmentData.id, assessmentData);
      
      if (result) {
        logger.info('EVALUATION', 'Insights regeneration successful', { assessmentId: assessmentData.id });
        toast({
          title: "Insights Regenerated",
          description: "Assessment insights have been successfully regenerated.",
        });
        
        // Update local state if we have new data
        if (setAssessmentData && result !== assessmentData) {
          setAssessmentData(result);
        }
      } else {
        logger.warn('EVALUATION', 'Insights regeneration returned null/false', { assessmentId: assessmentData.id });
        toast({
          title: "Regeneration Failed",
          description: "Failed to regenerate insights. Please try again.",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      logger.error('EVALUATION', 'Error in regenerateInsights', { assessmentId: assessmentData.id, error: error.message });
      toast({
        title: "Regeneration Error",
        description: `Error: ${error.message || "Unknown error occurred"}`,
        variant: "destructive",
      });
      return null;
    }
  }, [assessmentData, generateInsightsOnly, canStartAnalysis, setAssessmentData]);

  // Force stop analysis with user confirmation and logging
  const handleForceStopAnalysis = useCallback(() => {
    if (window.confirm('Are you sure you want to force stop the analysis? This will reset all analysis progress.')) {
      logger.info('EVALUATION', 'Force stopping analysis', { assessmentId: assessmentData?.id });
      forceStopAnalysis();
    }
  }, [forceStopAnalysis, assessmentData?.id]);

  // Memoized state for performance
  const evaluationState = useMemo(() => ({
    analysisInProgress,
    evaluating,
    generatingSummary,
    generatingAnalysis,
    canStartAnalysis
  }), [analysisInProgress, evaluating, generatingSummary, generatingAnalysis, canStartAnalysis]);

  return {
    // Unified analysis interface (optimized with memoization)
    ...evaluationState,
    
    // Actions
    handleManualEvaluation,
    regenerateInsights,
    generateAdvancedAnalysis,
    resetAnalysisState,
    handleForceStopAnalysis,
    
    // Legacy support
    rateLimitInfo,
    setGeneratingSummary: () => {} // No-op for backward compatibility
  };
};
