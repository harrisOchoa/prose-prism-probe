import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { unifiedAnalysisService, AnalysisProgress, AnalysisRequest } from "@/services/analysis/UnifiedAnalysisService";
import { useOptimizedUnifiedAnalysis } from "./useOptimizedUnifiedAnalysis";
import { AssessmentData } from "@/types/assessment";

export const useUnifiedAnalysis = () => {
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Use the optimized analysis service
  const {
    startOptimizedAnalysis,
    analysisProgress: optimizedProgress,
    getAnalysisHealth
  } = useOptimizedUnifiedAnalysis();

  const startAnalysis = async (
    assessmentId: string, 
    assessmentData: AssessmentData,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<boolean> => {
    if (!assessmentId) return false;
    
    try {
      // Try optimized analysis first
      const optimizedResult = await startOptimizedAnalysis(assessmentId, assessmentData, priority);
      
      if (optimizedResult) {
        return true;
      }
      
      // Fallback to original unified analysis
      console.log("Falling back to original unified analysis service");
      return await startLegacyAnalysis(assessmentId, assessmentData, priority);
      
    } catch (error: any) {
      console.error("Error in unified analysis:", error);
      toast({
        title: "Analysis Error",
        description: "There was an error with the analysis system. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const startLegacyAnalysis = async (
    assessmentId: string,
    assessmentData: AssessmentData,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<boolean> => {
    try {
      setAnalysisInProgress(true);
      setEvaluating(true);
      setGeneratingSummary(true);
      
      toast({
        title: "Analysis Started",
        description: "Using legacy analysis system...",
      });

      const request: AnalysisRequest = {
        assessmentId,
        assessmentData,
        priority
      };
      
      const progress = await unifiedAnalysisService.analyzeAssessment(request);
      setAnalysisProgress(progress);
      
      if (progress.status === 'failed') {
        console.error("Legacy analysis failed:", progress.error);
        toast({
          title: "Analysis Failed",
          description: "Analysis couldn't be completed.",
          variant: "destructive",
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
      console.error("Error during legacy analysis:", error);
      toast({
        title: "Analysis Error",
        description: `Error: ${error.message}`,
        variant: "destructive",
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
    // Enhanced unified interface
    analysisInProgress,
    analysisProgress: optimizedProgress || analysisProgress,
    startAnalysis,
    
    // Backward compatibility
    evaluating,
    generatingSummary,
    evaluateWritingOnly,
    generateInsightsOnly,
    
    // Health status with enhanced monitoring
    getHealthStatus: () => {
      const legacyHealth = unifiedAnalysisService.getHealthStatus();
      const optimizedHealth = getAnalysisHealth();
      
      return {
        ...legacyHealth,
        optimizedAnalysis: optimizedHealth
      };
    }
  };
};
