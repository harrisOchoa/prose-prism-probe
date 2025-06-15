
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { unifiedAnalysisService, AnalysisProgress } from "@/services/analysis/UnifiedAnalysisService";
import { AssessmentData } from "@/types/assessment";

export const useAssessmentAnalysis = () => {
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);

  const startAutomaticAnalysis = async (id: string, assessmentData: AssessmentData): Promise<boolean> => {
    if (!id) return false;
    
    try {
      setAnalysisInProgress(true);
      
      const healthStatus = unifiedAnalysisService.getHealthStatus();
      console.log("AI Service Health Status:", healthStatus);
      
      toast({
        title: "Analysis Started",
        description: "We're analyzing your assessment with our optimized unified system.",
      });
      
      const progress = await unifiedAnalysisService.analyzeAssessment({
        assessmentId: id,
        assessmentData,
        priority: 'normal'
      });
      
      setAnalysisProgress(progress);
      
      if (progress.status === 'failed') {
        console.error("Unified analysis failed:", progress.error);
        toast({
          title: "Analysis Incomplete",
          description: "Analysis couldn't be completed. An admin will review your assessment.",
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
      console.error("Error during unified analysis:", error);
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
    startAutomaticAnalysis,
    getHealthStatus: () => unifiedAnalysisService.getHealthStatus()
  };
};
