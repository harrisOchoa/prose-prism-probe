
import { createContext, useContext, useMemo } from 'react';

// Generic optimized context creator to reduce prop drilling
export function createOptimizedContext<T>() {
  const Context = createContext<T | undefined>(undefined);
  
  const useContextValue = () => {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error('useContext must be used within a Provider');
    }
    return context;
  };

  const Provider = ({ value, children }: { value: T; children: React.ReactNode }) => {
    // Memoize the context value to prevent unnecessary re-renders
    const memoizedValue = useMemo(() => value, [value]);

    return (
      <Context.Provider value={memoizedValue}>
        {children}
      </Context.Provider>
    );
  };

  return { Provider, useContext: useContextValue };
}

// Assessment context to reduce prop drilling
export interface AssessmentContextType {
  assessmentData: any;
  calculations: {
    getAptitudeScorePercentage: () => number;
    getWritingScorePercentage: () => number;
    getOverallScore: () => number;
    getProgressColor: (value: number) => string;
    getScoreColor: (score: number) => string;
    getScoreBgColor: (score: number) => string;
    getScoreLabel: (score: number) => string;
  };
  handlers: {
    generateAdvancedAnalysis: (type: string) => Promise<any>;
    forceStopAnalysis?: () => void;
  };
  state: {
    generatingSummary: boolean;
    generatingAnalysis: Record<string, boolean>;
    analysisBlocked?: boolean;
  };
}

export const {
  Provider: AssessmentProvider,
  useContext: useAssessmentContext
} = createOptimizedContext<AssessmentContextType>();

// Emergency analysis reset utility
export const emergencyAnalysisReset = () => {
  console.log('🚨 Emergency analysis reset triggered');
  
  // Clear any analysis state from sessionStorage/localStorage
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.includes('analysis') || key.includes('generating')) {
        sessionStorage.removeItem(key);
        console.log('Cleared session key:', key);
      }
    });
    
    const localKeys = Object.keys(localStorage);
    localKeys.forEach(key => {
      if (key.includes('analysis') || key.includes('generating')) {
        localStorage.removeItem(key);
        console.log('Cleared local key:', key);
      }
    });
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
  
  // Force page reload to reset all state
  setTimeout(() => {
    console.log('🔄 Force reloading page to reset analysis state');
    window.location.reload();
  }, 1000);
};
