
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { analysisLoopPrevention } from '@/services/analysis/AnalysisLoopPrevention';
import { logger } from '@/services/logging';
import { StuckAnalysisDetector } from '@/utils/stuckAnalysisDetector';

export type AnalysisState = 'idle' | 'evaluating' | 'generating_summary' | 'completed' | 'failed' | 'blocked';

interface AnalysisStateManager {
  state: AnalysisState;
  error: string | null;
  canStartAnalysis: boolean;
  isStuck: boolean;
  startAnalysis: (assessmentId: string) => boolean;
  completeAnalysis: (assessmentId: string) => void;
  failAnalysis: (assessmentId: string, error: string) => void;
  resetState: () => void;
  forceStopAnalysis: () => void;
  getStatusMessage: () => string;
}

export const useAnalysisStateManager = (assessmentId?: string): AnalysisStateManager => {
  const [state, setState] = useState<AnalysisState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isStuck, setIsStuck] = useState(false);
  const stateRef = useRef<AnalysisState>('idle');
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update ref when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Monitor for stuck analysis on mount and periodically
  useEffect(() => {
    const checkStuckAnalysis = () => {
      const stuckInfo = StuckAnalysisDetector.detect();
      setIsStuck(stuckInfo.isStuck);
      
      if (stuckInfo.isStuck) {
        console.log('🚨 Stuck analysis detected:', stuckInfo);
        StuckAnalysisDetector.logStuckAnalysisReport();
      }
    };

    // Check immediately
    checkStuckAnalysis();
    
    // Check every 30 seconds
    const interval = setInterval(checkStuckAnalysis, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Emergency detection of stuck analysis on mount
  useEffect(() => {
    const checkForStuckAnalysis = () => {
      const stuckStates = ['evaluating', 'generating_summary'];
      if (stuckStates.includes(state)) {
        const stateStartTime = sessionStorage.getItem(`analysis-start-${assessmentId}`);
        if (stateStartTime) {
          const elapsed = Date.now() - parseInt(stateStartTime);
          if (elapsed > 60000) { // 1 minute = definitely stuck
            console.log('🚨 Detected stuck analysis on mount, auto-resetting');
            forceStopAnalysis();
          }
        }
      }
    };

    checkForStuckAnalysis();
  }, [assessmentId]);

  // Auto-reset stuck states with timeout
  useEffect(() => {
    if (state === 'evaluating' || state === 'generating_summary') {
      // Store start time for stuck detection
      if (assessmentId) {
        sessionStorage.setItem(`analysis-start-${assessmentId}`, Date.now().toString());
      }

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set timeout to prevent stuck states - 45 seconds
      timeoutRef.current = setTimeout(() => {
        if (stateRef.current === 'evaluating' || stateRef.current === 'generating_summary') {
          console.log('Analysis state stuck, auto-resetting:', stateRef.current);
          
          setState('failed');
          setError('Analysis timed out and was automatically reset');
          
          if (assessmentId) {
            analysisLoopPrevention.failAnalysis(assessmentId, 'Analysis state timeout');
            sessionStorage.removeItem(`analysis-start-${assessmentId}`);
          }

          toast({
            title: "Analysis Timeout",
            description: "The analysis was taking too long and has been reset. Please try again.",
            variant: "destructive",
          });
        }
      }, 45000);
    } else {
      // Clear start time when not in analysis state
      if (assessmentId) {
        sessionStorage.removeItem(`analysis-start-${assessmentId}`);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state, assessmentId]);

  const canStartAnalysis = useCallback(() => {
    if (!assessmentId) {
      console.log('Cannot start analysis: no assessment ID');
      return false;
    }
    
    const canStart = analysisLoopPrevention.canStartAnalysis(assessmentId);
    const status = analysisLoopPrevention.getStatus(assessmentId);
    
    if (!canStart) {
      if (status.cooldownRemaining > 0) {
        setState('blocked');
        const minutesRemaining = Math.ceil(status.cooldownRemaining / 1000 / 60);
        setError(`Analysis is temporarily blocked. Please wait ${minutesRemaining} minutes before trying again.`);
        
        toast({
          title: "Analysis Blocked",
          description: `Too many failed attempts. Please wait ${minutesRemaining} minutes before trying again.`,
          variant: "destructive",
        });
      }
      return false;
    }
    
    return state === 'idle' || state === 'failed';
  }, [assessmentId, state]);

  const startAnalysis = useCallback((id: string) => {
    console.log('Attempting to start analysis for:', id);
    
    if (!canStartAnalysis()) {
      console.log('Cannot start analysis - conditions not met');
      return false;
    }

    const success = analysisLoopPrevention.startAnalysis(id);
    if (success) {
      setState('evaluating');
      setError(null);
      setIsStuck(false);
      console.log('Analysis started successfully for:', id);
      
      toast({
        title: "Analysis Started",
        description: "Evaluating your assessment responses...",
      });
    } else {
      console.log('Failed to start analysis - loop prevention blocked it');
      toast({
        title: "Analysis In Progress",
        description: "An analysis is already running for this assessment.",
        variant: "destructive",
      });
    }
    
    return success;
  }, [canStartAnalysis]);

  const completeAnalysis = useCallback((id: string) => {
    console.log('Completing analysis for:', id);
    analysisLoopPrevention.completeAnalysis(id);
    setState('completed');
    setError(null);
    setIsStuck(false);
    
    // Clear timeout and start time
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    sessionStorage.removeItem(`analysis-start-${id}`);
    
    toast({
      title: "Analysis Complete",
      description: "Your assessment has been analyzed successfully.",
    });
  }, []);

  const failAnalysis = useCallback((id: string, errorMessage: string) => {
    console.log('Analysis failed for:', id, 'Error:', errorMessage);
    analysisLoopPrevention.failAnalysis(id, errorMessage);
    setState('failed');
    setError(errorMessage);
    setIsStuck(false);
    
    // Clear timeout and start time
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    sessionStorage.removeItem(`analysis-start-${id}`);
    
    toast({
      title: "Analysis Failed",
      description: errorMessage || "Analysis encountered an error. Please try again.",
      variant: "destructive",
    });
  }, []);

  const resetState = useCallback(() => {
    console.log('Resetting analysis state for:', assessmentId);
    setState('idle');
    setError(null);
    setIsStuck(false);
    
    // Clear timeout and start time
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (assessmentId) {
      sessionStorage.removeItem(`analysis-start-${assessmentId}`);
    }
  }, [assessmentId]);

  const forceStopAnalysis = useCallback(() => {
    console.log('🚨 Force stopping analysis for:', assessmentId);
    
    // Clear all timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Use the stuck analysis detector to clear everything
    StuckAnalysisDetector.clearStuckAnalysis();
    
    // Reset state immediately
    setState('idle');
    setError(null);
    setIsStuck(false);
    
    // Clear analysis prevention state
    if (assessmentId) {
      analysisLoopPrevention.completeAnalysis(assessmentId);
      sessionStorage.removeItem(`analysis-start-${assessmentId}`);
    }
    
    toast({
      title: "Analysis Stopped",
      description: "Analysis has been forcefully stopped and reset.",
    });
    
    // Force page reload after a short delay to ensure complete reset
    setTimeout(() => {
      console.log('🔄 Reloading page to ensure complete reset');
      window.location.reload();
    }, 2000);
  }, [assessmentId]);

  const getStatusMessage = useCallback(() => {
    if (isStuck) {
      return 'Analysis appears to be stuck - use Emergency Reset';
    }
    
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
  }, [state, error, isStuck]);

  return {
    state,
    error,
    isStuck,
    canStartAnalysis: canStartAnalysis(),
    startAnalysis,
    completeAnalysis,
    failAnalysis,
    resetState,
    forceStopAnalysis,
    getStatusMessage
  };
};
