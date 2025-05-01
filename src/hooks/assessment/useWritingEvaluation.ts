
import { useState } from "react";
import { AssessmentData } from "@/types/assessment";
import { useWritingScores, useInsightsGeneration } from "./writing";

/**
 * Hook for handling writing evaluation functionality
 */
export const useWritingEvaluation = (
  assessmentData: AssessmentData, 
  setAssessmentData: (data: AssessmentData) => void
) => {
  const { 
    evaluating, 
    evaluateWritingResponses 
  } = useWritingScores(assessmentData, setAssessmentData);
  
  const { 
    generatingSummary, 
    setGeneratingSummary, 
    generateInsights 
  } = useInsightsGeneration(assessmentData, setAssessmentData);

  const handleManualEvaluation = async () => {
    const updatedData = await evaluateWritingResponses();
    
    if (updatedData) {
      setGeneratingSummary(true);
      await generateInsights(updatedData);
    }
  };
  
  const regenerateInsights = async () => {
    await generateInsights();
  };

  return {
    evaluating,
    generatingSummary,
    handleManualEvaluation,
    regenerateInsights,
    setGeneratingSummary
  };
};
