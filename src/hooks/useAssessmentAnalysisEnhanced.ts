
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { initiateAutomaticAnalysisEnhanced, AnalysisProgress } from "@/services/automaticAnalysis/initiateAnalysisEnhanced";
import { getAIServiceHealth } from "@/services/geminiEnhanced";
import { AssessmentData } from "@/types/assessment";

export const useAssessmentAnalysisEnhanced = () => {
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);

  const startAutomaticAnalysis = async (id: string, assessmentData: AssessmentData): Promise<boolean> => {
    if (!id) return false;
    
    try {
      setAnalysisInProgress(true);
      
      // Check AI service health
      const healthStatus = getAIServiceHealth();
      console.log("AI Service Health Status:", healthStatus);
      
      toast({
        title: "Enhanced Analysis Started",
        description: "We're analyzing your assessment with AI fallback support. This should be much faster and more reliable.",
      });
      
      // Start enhanced automatic analysis
      const progress = await initiateAutomaticAnalysisEnhanced(id, assessmentData);
      setAnalysisProgress(progress);
      
      if (progress.status === 'failed') {
        console.error("Enhanced automatic analysis failed:", progress.error);
        toast({
          title: "Analysis Incomplete",
          description: "Analysis couldn't be completed even with fallback AI. An admin will review your assessment.",
          variant: "default",
        });
        return false;
      } else {
        toast({
          title: "Enhanced Analysis Complete",
          description: "Your assessment has been analyzed successfully using our AI fallback system.",
        });
        return true;
      }
    } catch (error: any) {
      console.error("Error during enhanced automatic analysis:", error);
      toast({
        title: "Enhanced Analysis Error",
        description: "There was an error with the enhanced analysis system. An admin will review it manually.",
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
    getAIServiceHealth
  };
};
