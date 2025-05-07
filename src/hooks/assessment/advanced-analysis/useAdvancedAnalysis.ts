
import { useState, useCallback } from "react";
import { AssessmentData } from "@/types/assessment";
import type { AnalysisStateMap } from "./types";
import { useAnalysisValidation } from "./useAnalysisValidation";
import { generateAnalysis } from "./utils/generateAnalysis";
import { mapAnalysisType } from "./utils/analysisTypeMapping";

/**
 * Hook for handling advanced analysis generation functionality
 */
export const useAdvancedAnalysis = (
  assessmentData: AssessmentData,
  setAssessmentData: (data: AssessmentData) => void
) => {
  const [generatingAnalysis, setGeneratingAnalysis] = useState<AnalysisStateMap>({
    writing: false,
    personality: false,
    interview: false,
    questions: false,
    profile: false,
    aptitude: false
  });

  const { validateAnalysisPrerequisites } = useAnalysisValidation();

  /**
   * Main function to generate any type of advanced analysis
   */
  const generateAdvancedAnalysis = useCallback(async (type: string) => {
    try {
      // Map the type to analysis type, update key and generator function
      const { analysisType, updateKey, generatorFunction } = mapAnalysisType(type);
      
      // Validate prerequisites
      if (!validateAnalysisPrerequisites(assessmentData, analysisType)) {
        return null;
      }
      
      // Set generating state for this analysis type
      setGeneratingAnalysis(prev => ({ ...prev, [type]: true }));
      
      // Generate the analysis
      const result = await generateAnalysis(generatorFunction, assessmentData, updateKey);
      
      if (result) {
        // Update UI immediately with new data
        setAssessmentData(result.updatedData);
        return result.result;
      }
      
      return null;
    } catch (error) {
      console.error(`Error in generateAdvancedAnalysis for ${type}:`, error);
      return null;
    } finally {
      // Reset generating state for this analysis type regardless of success/failure
      setGeneratingAnalysis(prev => ({ ...prev, [type]: false }));
    }
  }, [assessmentData, setAssessmentData, validateAnalysisPrerequisites]);

  return {
    generatingAnalysis,
    generateAdvancedAnalysis
  };
};
