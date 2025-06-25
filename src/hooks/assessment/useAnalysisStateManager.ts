
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { analysisLoopPrevention } from '@/services/analysis/AnalysisLoopPrevention';
import { logger } from '@/services/logging';

export type AnalysisState = 'idle' | 'evaluating' | 'generating_summary' | 'completed' | 'failed' | 'blocked';

interface AnalysisStateManager {
  state: AnalysisState;
  error: string | null;
  canStartAnalysis: boolean;
  startAnalysis: (assessmentId: string) => boolean;
  completeAnalysis: (assessmentId: string) => void;
  failAnalysis: (assessmentId: string, error: string) => void;
  resetState: () => void;
  getStatusMessage: () => string;
}

export const useAnalysisStateManager = (assessmentId?: string): AnalysisStateManager => {
  const [state, setState] = useState<AnalysisState>('idle');
  const [error, setError] = useState<string | null>(null);
  const stateRef = useRef<AnalysisState>('idle');
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update ref when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Auto-reset stuck states
  useEffect(() => {
    if (state === 'evaluating' || state === 'generating_summary') {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set timeout to prevent stuck states
      timeoutRef.current = setTimeout(() => {
        if (stateRef.current === 'evaluating' || stateRef.current === 'generating_summary') {
          logger.warn('ANALYSIS_STATE', 'Analysis state stuck, auto-resetting', {
            assessmentId,
            stuckState: stateRef.current
          });
          
          setState('failed');
          setError('Analysis timed out and was automatically reset');
          
          if (assessmentId) {
            analysisLoopPrevention.failAnalysis(assessmentId, 'Analysis state timeout');
          }

          toast({
            title: "Analysis Timeout",
            description: "The analysis was taking too long and has been reset. Please try again.",
            variant: "destructive",
          });
        }
      }, 45000); // 45 second timeout
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state, assessmentId]);

  const canStartAnalysis = useCallback(() => {
    if (!assessmentId) return false;
    
    const canStart = analysisLoopPrevention.canStartAnalysis(assessmentId);
    const status = analysisLoopPrevention.getStatus(assessmentId);
    
    if (!canStart && status.cooldownRemaining > 0) {
      setState('blocked');
      setError(`Analysis is temporarily blocked. Please wait ${Math.ceil(status.cooldownRemaining / 1000 / 60)} minutes before trying again.`);
    }
    
    return canStart && state === 'idle';
  }, [assessmentId, state]);

  const startAnalysis = useCallback((id: string) => {
    if (!canStartAnalysis()) {
      return false;
    }

    const success = analysisLoopPrevention.startAnalysis(id);
    if (success) {
      setState('evaluating');
      setError(null);
      logger.info('ANALYSIS_STATE', 'Analysis started', { assessmentId: id });
    }
    
    return success;
  }, [canStartAnalysis]);

  const completeAnalysis = useCallback((id: string) => {
    analysisLoopPrevention.completeAnalysis(id);
    setState('completed');
    setError(null);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    logger.info('ANALYSIS_STATE', 'Analysis completed', { assessmentId: id });
  }, []);

  const failAnalysis = useCallback((id: string, errorMessage: string) => {
    analysisLoopPrevention.failAnalysis(id, errorMessage);
    setState('failed');
    setError(errorMessage);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    logger.error('ANALYSIS_STATE', 'Analysis failed', { assessmentId: id, error: errorMessage });
  }, []);

  const resetState = useCallback(() => {
    setState('idle');
    setError(null);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    logger.info('ANALYSIS_STATE', 'Analysis state reset', { assessmentId });
  }, [assessmentId]);

  const getStatusMessage = useCallback(() => {
    switch (state) {
      case 'idle':
        return 'Ready to analyze';
      case 'evaluating':
        return 'Evaluating writing responses...';
      case 'generating_summary':
        return 'Generating insights...';
      case 'completed':
        return 'Analysis completed successfully';
      case 'failed':
        return error || 'Analysis failed';
      case 'blocked':
        return error || 'Analysis temporarily blocked';
      default:
        return 'Unknown state';
    }
  }, [state, error]);

  return {
    state,
    error,
    canStartAnalysis: canStartAnalysis(),
    startAnalysis,
    completeAnalysis,
    failAnalysis,
    resetState,
    getStatusMessage
  };
};
