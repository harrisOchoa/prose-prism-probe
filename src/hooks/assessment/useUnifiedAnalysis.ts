import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { unifiedAnalysisService, AnalysisProgress, AnalysisRequest } from "@/services/analysis/UnifiedAnalysisService";
import { useOptimizedUnifiedAnalysis } from "./useOptimizedUnifiedAnalysis";
import { useAnalysisStateManager } from "./useAnalysisStateManager";
import { AssessmentData } from "@/types/assessment";
import { analysisLoopPrevention } from "@/services/analysis/AnalysisLoopPrevention";
import { logger } from "@/services/logging";

export const useUnifiedAnalysis = () => {
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);

  // Use the optimized analysis service
  const {
    startOptimizedAnalysis,
    analysisProgress: optimizedProgress,
    getAnalysisHealth
  } = useOptimizedUnifiedAnalysis();

  // Use the new state manager
  const stateManager = useAnalysisStateManager();

  const startAnalysis = async (
    assessmentId: string, 
    assessmentData: AssessmentData,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<boolean> => {
    if (!assessmentId) {
      logger.error('UNIFIED_ANALYSIS', 'Missing assessment ID');
      return false;
    }
    
    // Check if analysis can start
    if (!stateManager.canStartAnalysis) {
      toast({
        title: "Analysis Blocked",
        description: stateManager.getStatusMessage(),
        variant: "destructive",
      });
      return false;
    }

    // Start analysis with loop prevention
    if (!stateManager.startAnalysis(assessmentId)) {
      toast({
        title: "Analysis In Progress",
        description: "An analysis is already running for this assessment.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setAnalysisInProgress(true);
      
      logger.info('UNIFIED_ANALYSIS', 'Starting analysis with loop prevention', {
        assessmentId,
        priority,
        hasWritingPrompts: !!assessmentData.completedPrompts?.length
      });
      
      toast({
        title: "Analysis Started",
        description: "Using optimized analysis system with enhanced error handling.",
      });

      // Try optimized analysis first with timeout
      const optimizedResult = await analysisLoopPrevention.withTimeout(
        () => startOptimizedAnalysis(assessmentId, assessmentData, priority),
        45000 // 45 second timeout
      );
      
      if (optimizedResult) {
        stateManager.completeAnalysis(assessmentId);
        toast({
          title: "Analysis Complete",
          description: "Your assessment has been analyzed successfully.",
        });
        return true;
      }
      
      // Fallback to legacy system with timeout
      logger.info('UNIFIED_ANALYSIS', 'Falling back to legacy analysis');
      const legacyResult = await analysisLoopPrevention.withTimeout(
        () => startLegacyAnalysis(assessmentId, assessmentData, priority),
        45000
      );
      
      if (legacyResult) {
        stateManager.completeAnalysis(assessmentId);
        return true;
      }
      
      throw new Error('Both optimized and legacy analysis failed');
      
    } catch (error: any) {
      logger.error('UNIFIED_ANALYSIS', 'Analysis failed', { assessmentId, error: error.message });
      
      stateManager.failAnalysis(assessmentId, error.message);
      
      const isTimeout = error.message.includes('timeout') || error.message.includes('timed out');
      const isRateLimit = error.message.toLowerCase().includes('rate limit');
      
      if (isTimeout) {
        toast({
          title: "Analysis Timeout",
          description: "The analysis took too long and was cancelled. Please try again.",
          variant: "destructive",
        });
      } else if (isRateLimit) {
        toast({
          title: "Rate Limit Reached",
          description: "AI service rate limit reached. Please wait before trying again.",
          variant: "destructive",
          duration: 8000,
        });
      } else {
        toast({
          title: "Analysis Error",
          description: "There was an error with the analysis system. Please try again.",
          variant: "destructive",
        });
      }
      
      return false;
    } finally {
      setAnalysisInProgress(false);
    }
  };

  const startLegacyAnalysis = async (
    assessmentId: string,
    assessmentData: AssessmentData,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<boolean> => {
    try {
      toast({
        title: "Using Legacy Analysis",
        description: "Falling back to legacy analysis system...",
      });

      const request: AnalysisRequest = {
        assessmentId,
        assessmentData,
        priority
      };
      
      const progress = await unifiedAnalysisService.analyzeAssessment(request);
      setAnalysisProgress(progress);
      
      if (progress.status === 'failed') {
        throw new Error(progress.error || 'Legacy analysis failed');
      }
      
      toast({
        title: "Analysis Complete",
        description: "Your assessment has been analyzed successfully.",
      });
      return true;
    } catch (error: any) {
      logger.error('UNIFIED_ANALYSIS', 'Legacy analysis failed', error);
      throw error;
    }
  };

  const evaluateWritingOnly = async (
    assessmentId: string,
    assessmentData: AssessmentData
  ): Promise<boolean> => {
    try {
      if (!stateManager.canStartAnalysis) {
        return false;
      }

      stateManager.startAnalysis(assessmentId);
      
      toast({
        title: "Evaluating Writing",
        description: "Analyzing writing responses...",
      });

      const request: AnalysisRequest = {
        assessmentId,
        assessmentData,
        priority: 'high'
      };
      
      const progress = await analysisLoopPrevention.withTimeout(
        () => unifiedAnalysisService.analyzeAssessment(request)
      );
      
      if (progress.status === 'failed') {
        throw new Error(progress.error || 'Writing evaluation failed');
      }
      
      stateManager.completeAnalysis(assessmentId);
      toast({
        title: "Writing Evaluated",
        description: "Writing responses have been successfully evaluated.",
      });
      return true;
    } catch (error: any) {
      stateManager.failAnalysis(assessmentId, error.message);
      toast({
        title: "Evaluation Error",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const generateInsightsOnly = async (
    assessmentId: string,
    assessmentData: AssessmentData
  ): Promise<boolean> => {
    try {
      if (!stateManager.canStartAnalysis) {
        return false;
      }

      stateManager.startAnalysis(assessmentId);
      
      toast({
        title: "Generating Insights",
        description: "Creating summary and analysis...",
      });

      const request: AnalysisRequest = {
        assessmentId,
        assessmentData,
        priority: 'high'
      };
      
      const progress = await analysisLoopPrevention.withTimeout(
        () => unifiedAnalysisService.analyzeAssessment(request)
      );
      
      if (progress.status === 'failed') {
        throw new Error(progress.error || 'Insights generation failed');
      }
      
      stateManager.completeAnalysis(assessmentId);
      toast({
        title: "Insights Generated",
        description: "Assessment insights have been successfully generated.",
      });
      return true;
    } catch (error: any) {
      stateManager.failAnalysis(assessmentId, error.message);
      toast({
        title: "Insights Error",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    // Enhanced unified interface
    analysisInProgress,
    analysisProgress: optimizedProgress || analysisProgress,
    startAnalysis,
    
    // State management
    analysisState: stateManager.state,
    canStartAnalysis: stateManager.canStartAnalysis,
    resetAnalysisState: stateManager.resetState,
    
    // Backward compatibility
    evaluating: stateManager.state === 'evaluating',
    generatingSummary: stateManager.state === 'generating_summary',
    evaluateWritingOnly,
    generateInsightsOnly,
    
    // Health status with enhanced monitoring
    getHealthStatus: () => {
      const legacyHealth = unifiedAnalysisService.getHealthStatus();
      const optimizedHealth = getAnalysisHealth();
      
      return {
        ...legacyHealth,
        optimizedAnalysis: optimizedHealth,
        loopPrevention: {
          canStart: stateManager.canStartAnalysis,
          state: stateManager.state,
          error: stateManager.error
        }
      };
    }
  };
};
