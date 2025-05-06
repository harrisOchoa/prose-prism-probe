
import { useState } from "react";
import { AssessmentData } from "@/types/assessment";
import { useGenerateAnalysis } from "./useGenerateAnalysis";
import { useAnalysisValidation } from "./useAnalysisValidation";
import type { AnalysisStateMap } from "./types";
import { 
  generateDetailedWritingAnalysis,
  generatePersonalityInsights,
  generateInterviewQuestions,
  compareWithIdealProfile, 
  generateAptitudeAnalysis
} from "@/services/geminiService";

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

  const generateAdvancedAnalysis = async (type: string) => {
    // Map the type to analysis type and update key
    let analysisType: string;
    let updateKey: string;
    let generatorFunction: (data: AssessmentData) => Promise<any>;
    
    switch(type) {
      case 'writing':
        analysisType = 'writing';
        updateKey = 'detailedWritingAnalysis';
        generatorFunction = generateDetailedWritingAnalysis;
        break;
      case 'personality':
        analysisType = 'personality';
        updateKey = 'personalityInsights';
        generatorFunction = generatePersonalityInsights;
        break;
      case 'interview':
      case 'questions':
        analysisType = 'interview';
        updateKey = 'interviewQuestions';
        generatorFunction = generateInterviewQuestions;
        break;
      case 'profile':
        analysisType = 'profile';
        updateKey = 'profileMatch';
        generatorFunction = compareWithIdealProfile;
        break;
      case 'aptitude':
        analysisType = 'aptitude';
        updateKey = 'aptitudeAnalysis';
        generatorFunction = generateAptitudeAnalysis;
        break;
      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }
    
    // Validate prerequisites
    if (!validateAnalysisPrerequisites(assessmentData, analysisType as any)) {
      return null;
    }
    
    // Set generating state for this analysis type
    setGeneratingAnalysis(prev => ({ ...prev, [type]: true }));
    
    try {
      // Use the useGenerateAnalysis hook inline (can't use hooks conditionally)
      const generator = useGenerateAnalysis({
        assessmentData,
        setAssessmentData,
        generatorFunction,
        analysisType: analysisType as any,
        updateKey
      });
      
      const result = await generator.generate();
      return result;
    } finally {
      // Reset generating state for this analysis type regardless of success/failure
      setGeneratingAnalysis(prev => ({ ...prev, [type]: false }));
    }
  };

  return {
    generatingAnalysis,
    generateAdvancedAnalysis
  };
};
