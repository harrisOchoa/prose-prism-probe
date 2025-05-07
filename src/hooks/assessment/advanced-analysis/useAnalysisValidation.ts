
import { toast } from "@/hooks/use-toast";
import { AssessmentData } from "@/types/assessment";

/**
 * Hook for validating analysis prerequisites
 */
export const useAnalysisValidation = () => {
  /**
   * Validates if prerequisites for different analysis types exist
   */
  const validateAnalysisPrerequisites = (data: AssessmentData, analysisType: 'writing' | 'personality' | 'interview' | 'questions' | 'profile' | 'aptitude') => {
    // Basic validation for all analysis types
    if (!data || !data.id) {
      toast({
        title: "Missing Data",
        description: "Assessment data is incomplete. Please refresh the page.",
        variant: "destructive",
      });
      return false;
    }
    
    // All non-aptitude analyses require writing scores
    if (analysisType !== 'aptitude' && (!data.writingScores || !data.overallWritingScore)) {
      toast({
        title: "Writing Not Evaluated",
        description: "Please evaluate the writing first to generate this analysis.",
        variant: "destructive",
      });
      return false;
    }
    
    // Aptitude analysis requires aptitude scores
    if (analysisType === 'aptitude' && !data.aptitudeScore) {
      toast({
        title: "Aptitude Not Completed",
        description: "Candidate needs to complete the aptitude test first.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  return {
    validateAnalysisPrerequisites
  };
};
