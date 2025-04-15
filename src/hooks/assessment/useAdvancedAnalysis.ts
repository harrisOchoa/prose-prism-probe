import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { updateAssessmentAnalysis } from "@/firebase/assessmentService";
import { 
  generateDetailedWritingAnalysis,
  generateInterviewQuestions,
  generatePersonalityInsights,
  compareWithIdealProfile,
  generateAptitudeAnalysis
} from "@/services/geminiService";

/**
 * Hook for handling advanced analysis functionality
 */
export const useAdvancedAnalysis = (assessmentData: any, setAssessmentData: (data: any) => void) => {
  const [generatingAnalysis, setGeneratingAnalysis] = useState({
    detailed: false,
    personality: false,
    questions: false,
    profile: false,
    aptitude: false
  });

  const generateAdvancedAnalysis = async (analysisType: string) => {
    if (!assessmentData.writingScores || assessmentData.writingScores.length === 0) {
      toast({
        title: "No Writing Scores",
        description: "Please evaluate the writing first to generate advanced analysis.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      // Set the appropriate loading state
      setGeneratingAnalysis(prev => ({ ...prev, [analysisType]: true }));
      
      toast({
        title: "Generating Analysis",
        description: `System is generating ${analysisType} analysis. This may take a moment.`,
      });
      
      let result;
      const updateData: any = {};
      
      switch (analysisType) {
        case "detailed":
          result = await generateDetailedWritingAnalysis(assessmentData);
          updateData.detailedWritingAnalysis = result;
          break;
        case "personality":
          result = await generatePersonalityInsights(assessmentData);
          updateData.personalityInsights = result;
          break;
        case "questions":
          result = await generateInterviewQuestions(assessmentData);
          updateData.interviewQuestions = result;
          break;
        case "profile":
          result = await compareWithIdealProfile(assessmentData);
          updateData.profileMatch = result;
          break;
        case "aptitude":
          result = await generateAptitudeAnalysis(assessmentData);
          updateData.aptitudeAnalysis = result;
          break;
        default:
          throw new Error("Invalid analysis type");
      }
      
      // Save to Firebase
      await updateAssessmentAnalysis(assessmentData.id, updateData);
      
      // Update local state
      setAssessmentData({
        ...assessmentData,
        ...updateData
      });
      
      console.log(`Updated ${analysisType} analysis data:`, result);
      
      toast({
        title: "Analysis Complete",
        description: `${analysisType} analysis has been generated and saved successfully.`,
      });
      
      return result;
    } catch (error) {
      console.error(`Error generating ${analysisType} analysis:`, error);
      toast({
        title: "Analysis Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      // Reset the loading state
      setGeneratingAnalysis(prev => ({ ...prev, [analysisType]: false }));
    }
  };

  return {
    generatingAnalysis,
    generateAdvancedAnalysis
  };
};
