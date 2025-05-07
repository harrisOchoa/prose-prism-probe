
import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { AssessmentData } from "@/types/assessment";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import type { AnalysisStateMap } from "./types";
import { useAnalysisValidation } from "./useAnalysisValidation";
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

  /**
   * Core generate function for all analysis types
   */
  const generateAnalysis = useCallback(async (generatorFunction: Function, data: AssessmentData, updateKey: string) => {
    try {
      console.log(`Starting analysis generation for ${updateKey}...`);
      
      toast({
        title: "Generating Analysis",
        description: `Generating analysis. This may take up to 30 seconds.`,
      });
      
      let result;
      let attempt = 0;
      const maxAttempts = 2;
      
      while (attempt < maxAttempts) {
        try {
          attempt++;
          console.log(`Analysis attempt ${attempt} for ${updateKey}...`);
          
          result = await generatorFunction(data);
          
          if (result) break;
        } catch (attemptError: any) {
          console.error(`Error in attempt ${attempt}:`, attemptError);
          
          if (attempt >= maxAttempts || !attemptError.message?.toLowerCase().includes('rate limit')) {
            throw attemptError;
          }
          
          const waitTime = attempt * 2000;
          console.log(`Rate limit detected. Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          toast({
            title: "Retrying Analysis",
            description: `API rate limit reached. Retrying in ${waitTime/1000} seconds...`,
          });
        }
      }
      
      if (!result) {
        throw new Error(`Failed to generate analysis after ${maxAttempts} attempts.`);
      }
      
      console.log(`Generated ${updateKey} analysis:`, result);
      
      // Create a deep copy of the assessment data before updating
      const updatedData = JSON.parse(JSON.stringify(data));
      updatedData[updateKey] = result;
      
      // Immediately update UI with the new data
      console.log(`Updating UI with new ${updateKey} analysis`);
      setAssessmentData(updatedData);
      
      // Update Firebase in background
      try {
        console.log(`Starting Firebase update for ${updateKey}`);
        await updateAssessmentAnalysis(data.id, {
          [updateKey]: result
        });
        
        console.log(`Successfully updated ${updateKey} in Firebase`);
        
        toast({
          title: "Analysis Complete",
          description: `${updateKey} analysis has been generated successfully.`,
        });
        
        return result;
      } catch (updateError: any) {
        console.error(`Error updating ${updateKey} in Firebase:`, updateError);
        
        toast({
          title: "Update Failed",
          description: "Analysis was generated but could not be saved to the database.",
          variant: "destructive",
        });
        
        return result;
      }
    } catch (error: any) {
      console.error(`Error generating ${updateKey}:`, error);
      
      let errorMessage = "Unknown error occurred";
      
      if (error.message) {
        if (error.message.includes("rate limit")) {
          errorMessage = "API rate limit reached. Please wait a few minutes and try again.";
        } else if (error.message.includes("API key")) {
          errorMessage = "Invalid or missing API key. Check your Gemini API configuration.";
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    }
  }, [setAssessmentData]);

  /**
   * Main function to generate any type of advanced analysis
   */
  const generateAdvancedAnalysis = useCallback(async (type: string) => {
    // Map the type to analysis type and update key
    let analysisType: string;
    let updateKey: string;
    let generatorFunction: (data: AssessmentData) => Promise<any>;
    
    switch(type.toLowerCase()) {
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
    if (!validateAnalysisPrerequisites(assessmentData, analysisType)) {
      return null;
    }
    
    // Set generating state for this analysis type
    setGeneratingAnalysis(prev => ({ ...prev, [type]: true }));
    
    try {
      // Generate the analysis
      const result = await generateAnalysis(generatorFunction, assessmentData, updateKey);
      return result;
    } finally {
      // Reset generating state for this analysis type regardless of success/failure
      setGeneratingAnalysis(prev => ({ ...prev, [type]: false }));
    }
  }, [assessmentData, generateAnalysis, validateAnalysisPrerequisites]);

  return {
    generatingAnalysis,
    generateAdvancedAnalysis
  };
};
