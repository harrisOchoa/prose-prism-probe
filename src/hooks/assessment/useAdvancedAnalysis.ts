
import { useState } from "react";
import { 
  generateDetailedWritingAnalysis,
  generatePersonalityInsights,
  generateInterviewQuestions,
  compareWithIdealProfile
} from "@/services/geminiService";
import { updateAssessmentAnalysis } from "@/firebase/assessmentService";
import { toast } from "@/hooks/use-toast";

export const useAdvancedAnalysis = (assessmentData: any, setAssessmentData: (data: any) => void) => {
  const [generatingAnalysis, setGeneratingAnalysis] = useState<Record<string, boolean>>({});

  /**
   * Generate advanced analysis based on type
   */
  const generateAdvancedAnalysis = async (type: string): Promise<any> => {
    if (!assessmentData || !assessmentData.writingScores || assessmentData.writingScores.length === 0) {
      toast({
        title: "Writing Evaluation Required",
        description: "Writing must be evaluated before generating analysis.",
        variant: "destructive",
      });
      return Promise.reject(new Error("Writing evaluation required"));
    }

    const analysisType = type.toLowerCase();
    setGeneratingAnalysis(prev => ({ ...prev, [analysisType]: true }));

    try {
      let result;
      let updateField;
      
      switch (analysisType) {
        case 'writing':
        case 'detailed':  // Add 'detailed' as an alias for 'writing'
          result = await generateDetailedWritingAnalysis(assessmentData);
          updateField = 'detailedWritingAnalysis';
          break;
        case 'personality':
          result = await generatePersonalityInsights(assessmentData);
          updateField = 'personalityInsights';
          break;
        case 'interview':
        case 'questions': // Add 'questions' as an alias for 'interview'
          result = await generateInterviewQuestions(assessmentData);
          updateField = 'interviewQuestions';
          break;
        case 'profile':
          result = await compareWithIdealProfile(assessmentData);
          updateField = 'profileMatch';
          break;
        default:
          throw new Error(`Unknown analysis type: ${type}`);
      }
      
      // Update assessment data state
      const updatedData = { ...assessmentData, [updateField]: result };
      setAssessmentData(updatedData);
      
      // Update in database
      await updateAssessmentAnalysis(assessmentData.id, { [updateField]: result });
      
      toast({
        title: "Analysis Complete",
        description: `${type} analysis has been generated successfully.`,
      });
      
      return result;
    } catch (error) {
      console.error(`Error generating ${type} analysis:`, error);
      toast({
        title: "Analysis Failed",
        description: `Could not generate ${type} analysis. Please try again.`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setGeneratingAnalysis(prev => ({ ...prev, [analysisType]: false }));
    }
  };

  return {
    generatingAnalysis,
    generateAdvancedAnalysis
  };
};
