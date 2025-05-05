import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  generateDetailedWritingAnalysis,
  generatePersonalityInsights,
  generateInterviewQuestions,
  compareWithIdealProfile as generateProfileMatch,
  generateAptitudeAnalysis
} from "@/services/geminiService";
import { updateAssessmentAnalysis } from "@/firebase/assessmentService";
import { AssessmentData } from "@/types/assessment";

/**
 * Hook for handling advanced analysis generation functionality
 */
export const useAdvancedAnalysis = (
  assessmentData: AssessmentData,
  setAssessmentData: (data: AssessmentData) => void
) => {
  const [generatingAnalysis, setGeneratingAnalysis] = useState<{[key: string]: boolean}>({
    writing: false,
    personality: false,
    interview: false,
    profile: false,
    aptitude: false
  });

  const generateAdvancedAnalysis = async (type: string) => {
    if (!assessmentData.overallWritingScore && type !== 'aptitude') {
      toast({
        title: "Writing Not Evaluated",
        description: "Please evaluate the writing first to generate advanced analysis.",
        variant: "destructive",
      });
      return null;
    }
    
    // For aptitude analysis, we need aptitude scores
    if (type === 'aptitude' && !assessmentData.aptitudeScore) {
      toast({
        title: "Aptitude Results Needed",
        description: "This candidate needs to complete the aptitude test before analysis.",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Set generating state for this analysis type
      setGeneratingAnalysis(prev => ({ ...prev, [type]: true }));
      
      toast({
        title: "Generating Analysis",
        description: `Generating ${type} analysis. This may take a moment.`,
      });
      
      let result;
      let updateKey = '';
      
      switch(type) {
        case 'writing':
          result = await generateDetailedWritingAnalysis(assessmentData);
          updateKey = 'detailedWritingAnalysis';
          break;
        case 'personality':
          result = await generatePersonalityInsights(assessmentData);
          updateKey = 'personalityInsights';
          break;
        case 'interview':
        case 'questions':
          result = await generateInterviewQuestions(assessmentData);
          updateKey = 'interviewQuestions';
          break;
        case 'profile':
          result = await generateProfileMatch(assessmentData);
          updateKey = 'profileMatch';
          break;
        case 'aptitude':
          result = await generateAptitudeAnalysis(assessmentData);
          updateKey = 'aptitudeAnalysis';
          break;
        default:
          throw new Error(`Unknown analysis type: ${type}`);
      }
      
      if (!result) {
        throw new Error(`Failed to generate ${type} analysis`);
      }
      
      console.log(`Generated ${type} analysis:`, result);
      
      // Update local state immediately
      const updatedData = {
        ...assessmentData,
        [updateKey]: result
      };
      
      setAssessmentData(updatedData);
      
      // Update Firebase
      await updateAssessmentAnalysis(assessmentData.id, {
        [updateKey]: result
      });
      
      toast({
        title: "Analysis Complete",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} analysis has been generated successfully.`,
      });
      
      return result;
    } catch (error: any) {
      console.error(`Error generating ${type} analysis:`, error);
      toast({
        title: "Analysis Failed",
        description: error.message && error.message.includes("rate limit") 
          ? "API rate limit reached. Please wait a few minutes and try again."
          : `Error: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
      return null;
    } finally {
      // Reset generating state for this analysis type
      setGeneratingAnalysis(prev => ({ ...prev, [type]: false }));
    }
  };

  return {
    generatingAnalysis,
    generateAdvancedAnalysis
  };
};
