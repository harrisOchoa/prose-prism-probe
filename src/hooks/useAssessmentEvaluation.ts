
import { useState } from "react";
import { useWritingEvaluation } from "./assessment/useWritingEvaluation";
import { useAdvancedAnalysis } from "./assessment/useAdvancedAnalysis";

/**
 * Main hook for assessment evaluation that combines writing evaluation and advanced analysis
 */
export const useAssessmentEvaluation = (assessmentData: any, setAssessmentData: (data: any) => void) => {
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

  // Return a combined API for the components to use
  return {
    evaluating,
    generatingSummary,
    generatingAnalysis,
    handleManualEvaluation,
    regenerateInsights,
    generateAdvancedAnalysis,
    setGeneratingSummary
  };
};
