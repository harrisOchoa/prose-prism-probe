
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
    resetAnalysisState,
    forceStopAnalysis
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

  // Enhanced regenerate insights with unified system and proper debugging
  const regenerateInsights = useCallback(async () => {
    if (!assessmentData || !assessmentData.id) {
      console.error("Cannot regenerate insights: missing assessment data or ID");
      toast({
        title: "Missing Assessment",
        description: "No assessment data available.",
        variant: "destructive",
      });
      return null;
    }

    console.log("Regenerating insights for:", assessmentData.id);
    console.log("Assessment data:", {
      id: assessmentData.id,
      hasWritingScores: !!assessmentData.writingScores,
      writingScoresLength: assessmentData.writingScores?.length || 0,
      canStart: canStartAnalysis
    });
    
    // Check if analysis can start - treat as boolean, not function
    if (!canStartAnalysis) {
      console.log("Cannot start analysis - canStartAnalysis is false");
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
        console.log("Insights regeneration successful");
        toast({
          title: "Insights Regenerated",
          description: "Assessment insights have been successfully regenerated.",
        });
        
        // Update local state if we have new data
        if (setAssessmentData && result !== assessmentData) {
          setAssessmentData(result);
        }
      } else {
        console.log("Insights regeneration returned null/false");
        toast({
          title: "Regeneration Failed",
          description: "Failed to regenerate insights. Please try again.",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("Error in regenerateInsights:", error);
      toast({
        title: "Regeneration Error",
        description: `Error: ${error.message || "Unknown error occurred"}`,
        variant: "destructive",
      });
      return null;
    }
  }, [assessmentData, generateInsightsOnly, canStartAnalysis, setAssessmentData]);

  // Force stop analysis with user confirmation
  const handleForceStopAnalysis = useCallback(() => {
    if (window.confirm('Are you sure you want to force stop the analysis? This will reset all analysis progress.')) {
      console.log("Force stopping analysis for:", assessmentData?.id);
      forceStopAnalysis();
    }
  }, [forceStopAnalysis, assessmentData?.id]);

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
    handleForceStopAnalysis,
    
    // Legacy support
    rateLimitInfo,
    setGeneratingSummary: () => {} // No-op for backward compatibility
  };
};
