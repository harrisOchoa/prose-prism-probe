
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { unifiedAnalysisService, AnalysisProgress, AnalysisRequest } from "@/services/analysis/UnifiedAnalysisService";
import { AssessmentData } from "@/types/assessment";

export const useUnifiedAnalysis = () => {
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const startAnalysis = async (
    assessmentId: string, 
    assessmentData: AssessmentData,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<boolean> => {
    if (!assessmentId) return false;
    
    try {
      setAnalysisInProgress(true);
      setEvaluating(true);
      setGeneratingSummary(true);
      
      const healthStatus = unifiedAnalysisService.getHealthStatus();
      console.log("AI Service Health Status:", healthStatus);
      
      toast({
        title: "Analysis Started",
        description: "We're analyzing your assessment with our optimized AI system. This should be fast and reliable.",
      });

      const request: AnalysisRequest = {
        assessmentId,
        assessmentData,
        priority
      };
      
      const progress = await unifiedAnalysisService.analyzeAssessment(request);
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
          description: "Your assessment has been analyzed successfully using our optimized system.",
        });
        return true;
      }
    } catch (error: any) {
      console.error("Error during unified analysis:", error);
      toast({
        title: "Analysis Error",
        description: "There was an error with the analysis system. An admin will review it manually.",
        variant: "default",
      });
      return false;
    } finally {
      setAnalysisInProgress(false);
      setEvaluating(false);
      setGeneratingSummary(false);
    }
  };

  const evaluateWritingOnly = async (
    assessmentId: string,
    assessmentData: AssessmentData
  ): Promise<boolean> => {
    try {
      setEvaluating(true);
      
      toast({
        title: "Evaluating Writing",
        description: "Analyzing writing responses...",
      });

      const request: AnalysisRequest = {
        assessmentId,
        assessmentData,
        priority: 'high'
      };
      
      const progress = await unifiedAnalysisService.analyzeAssessment(request);
      
      if (progress.status === 'failed') {
        toast({
          title: "Evaluation Failed",
          description: "Could not evaluate writing responses.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Writing Evaluated",
        description: "Writing responses have been successfully evaluated.",
      });
      return true;
    } catch (error: any) {
      console.error("Error evaluating writing:", error);
      toast({
        title: "Evaluation Error",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setEvaluating(false);
    }
  };

  const generateInsightsOnly = async (
    assessmentId: string,
    assessmentData: AssessmentData
  ): Promise<boolean> => {
    try {
      setGeneratingSummary(true);
      
      toast({
        title: "Generating Insights",
        description: "Creating summary and analysis...",
      });

      const request: AnalysisRequest = {
        assessmentId,
        assessmentData,
        priority: 'high'
      };
      
      const progress = await unifiedAnalysisService.analyzeAssessment(request);
      
      if (progress.status === 'failed') {
        toast({
          title: "Insights Failed",
          description: "Could not generate insights.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Insights Generated",
        description: "Assessment insights have been successfully generated.",
      });
      return true;
    } catch (error: any) {
      console.error("Error generating insights:", error);
      toast({
        title: "Insights Error",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setGeneratingSummary(false);
    }
  };

  return {
    // Unified interface
    analysisInProgress,
    analysisProgress,
    startAnalysis,
    
    // Backward compatibility
    evaluating,
    generatingSummary,
    evaluateWritingOnly,
    generateInsightsOnly,
    
    // Health status
    getHealthStatus: () => unifiedAnalysisService.getHealthStatus()
  };
};
