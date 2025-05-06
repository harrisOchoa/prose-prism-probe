
import { AssessmentData } from "@/types/assessment";
import { toast } from "@/hooks/use-toast";

type AnalysisType = 'writing' | 'personality' | 'interview' | 'questions' | 'profile' | 'aptitude';

/**
 * Hook for validating prerequisites before generating analysis
 */
export const useAnalysisValidation = () => {
  
  const validateAnalysisPrerequisites = (
    assessmentData: AssessmentData,
    analysisType: AnalysisType
  ): boolean => {
    if (!assessmentData?.id) {
      console.error("Missing assessment ID");
      toast({
        title: "Error",
        description: "Assessment data is not properly loaded. Please refresh the page.",
        variant: "destructive",
      });
      return false;
    }

    if (!assessmentData.overallWritingScore && analysisType !== 'aptitude') {
      console.error("Writing not evaluated yet");
      toast({
        title: "Writing Not Evaluated",
        description: "Please evaluate the writing first to generate advanced analysis.",
        variant: "destructive",
      });
      return false;
    }
    
    // For aptitude analysis, we need aptitude scores
    if (analysisType === 'aptitude' && !assessmentData.aptitudeScore) {
      console.error("Missing aptitude score");
      toast({
        title: "Aptitude Results Needed",
        description: "This candidate needs to complete the aptitude test before analysis.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { validateAnalysisPrerequisites };
};
