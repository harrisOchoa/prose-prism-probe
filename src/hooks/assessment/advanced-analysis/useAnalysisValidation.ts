
import { toast } from "@/hooks/use-toast";
import { AssessmentData } from "@/types/assessment";

/**
 * Hook for validating analysis prerequisites
 */
export const useAnalysisValidation = () => {
  /**
   * Validates if prerequisites for different analysis types exist
   */
  const validateAnalysisPrerequisites = (data: AssessmentData, analysisType: string) => {
    // Basic validation for all analysis types
    if (!data || !data.id) {
      toast({
        title: "Missing Data",
        description: "Assessment data is incomplete. Please refresh the page.",
        variant: "destructive",
      });
      return false;
    }
    
    // Convert to standard type for switch
    const type = analysisType.toLowerCase();
    
    // Check type-specific prerequisites
    switch (type) {
      case 'aptitude':
        if (!data.aptitudeScore && data.aptitudeScore !== 0) {
          toast({
            title: "Aptitude Not Completed",
            description: "Candidate needs to complete the aptitude test first.",
            variant: "destructive",
          });
          return false;
        }
        break;
        
      case 'writing':
      case 'personality':
      case 'interview':
      case 'questions':
      case 'profile':
        if (!data.writingScores || !data.overallWritingScore) {
          toast({
            title: "Writing Not Evaluated",
            description: "Please evaluate the writing first to generate this analysis.",
            variant: "destructive",
          });
          return false;
        }
        break;
        
      default:
        console.warn(`Unknown analysis type: ${analysisType}`);
        return false;
    }
    
    return true;
  };

  return {
    validateAnalysisPrerequisites
  };
};
