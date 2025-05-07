
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { initiateAutomaticAnalysis, AnalysisProgress } from "@/services/automaticAnalysis";
import { AssessmentData } from "@/types/assessment";

export const useAssessmentAnalysis = () => {
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);

  const startAutomaticAnalysis = async (id: string, assessmentData: AssessmentData): Promise<boolean> => {
    if (!id) return false;
    
    try {
      setAnalysisInProgress(true);
      toast({
        title: "Analysis Started",
        description: "We're analyzing your assessment in the background. This might take a few moments.",
      });
      
      // Start automatic analysis
      const progress = await initiateAutomaticAnalysis(id, assessmentData);
      setAnalysisProgress(progress);
      
      if (progress.status === 'failed') {
        console.error("Automatic analysis failed:", progress.error);
        toast({
          title: "Analysis Incomplete",
          description: "Some parts of the analysis couldn't be completed automatically. An admin will review your assessment.",
          variant: "default",
        });
        return false;
      } else {
        toast({
          title: "Analysis Complete",
          description: "Your assessment has been analyzed successfully.",
        });
        return true;
      }
    } catch (error: any) {
      console.error("Error during automatic analysis:", error);
      toast({
        title: "Analysis Error",
        description: "There was an error analyzing your assessment. An admin will review it manually.",
        variant: "default",
      });
      return false;
    } finally {
      setAnalysisInProgress(false);
    }
  };

  return {
    analysisInProgress,
    analysisProgress,
    startAutomaticAnalysis
  };
};
