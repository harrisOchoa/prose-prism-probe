
import { useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { performanceOptimizedAnalysisService, ProgressiveAnalysisResult } from "@/services/analysis/PerformanceOptimizedAnalysisService";
import { AssessmentData } from "@/types/assessment";

export const useOptimizedUnifiedAnalysis = () => {
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<ProgressiveAnalysisResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const startOptimizedAnalysis = useCallback(async (
    assessmentId: string, 
    assessmentData: AssessmentData,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<boolean> => {
    if (!assessmentId) return false;
    
    try {
      setAnalysisInProgress(true);
      setEvaluating(true);
      setGeneratingSummary(true);
      
      let toastId: any;
      
      const result = await performanceOptimizedAnalysisService.analyzeWithProgress(
        assessmentId,
        assessmentData,
        (progressResult) => {
          setAnalysisProgress(progressResult);
          
          // Update UI state based on current step
          if (progressResult.currentStep.includes('writing')) {
            setEvaluating(true);
            setGeneratingSummary(false);
          } else if (progressResult.currentStep.includes('insights')) {
            setEvaluating(false);
            setGeneratingSummary(true);
          }
          
          // Show progress toast
          if (!toastId) {
            toastId = toast({
              title: "Analysis in Progress",
              description: `${progressResult.currentStep} (${progressResult.progress}%)`,
              duration: 10000,
            });
          }
        },
        {
          timeoutMs: priority === 'high' ? 45000 : 30000,
          enableParallelProcessing: true,
          enableProgressiveResults: true,
          maxRetries: priority === 'high' ? 3 : 2
        }
      );
      
      setAnalysisProgress(result);
      
      if (result.status === 'failed') {
        console.error("Optimized analysis failed:", result.error);
        toast({
          title: "Analysis Failed",
          description: result.error || "Analysis could not be completed.",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Analysis Complete",
          description: `Completed ${result.completedSteps.length} analysis steps successfully.`,
        });
        return true;
      }
    } catch (error: any) {
      console.error("Error during optimized analysis:", error);
      toast({
        title: "Analysis Error",
        description: error.message || "An unexpected error occurred during analysis.",
        variant: "destructive",
      });
      return false;
    } finally {
      setAnalysisInProgress(false);
      setEvaluating(false);
      setGeneratingSummary(false);
    }
  }, []);

  const getAnalysisHealth = useCallback(() => {
    return {
      activeAnalyses: performanceOptimizedAnalysisService.getActiveAnalysesCount(),
      isHealthy: !analysisInProgress || analysisProgress?.status !== 'failed'
    };
  }, [analysisInProgress, analysisProgress]);

  return {
    // Progressive analysis interface
    analysisInProgress,
    analysisProgress,
    startOptimizedAnalysis,
    
    // Backward compatibility
    evaluating,
    generatingSummary,
    
    // Health monitoring
    getAnalysisHealth,
    
    // Manual state control (for special cases)
    setEvaluating,
    setGeneratingSummary
  };
};
