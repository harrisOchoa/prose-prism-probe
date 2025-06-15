
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
    const memoizedValue = useMemo(() => value, [
      // Use JSON.stringify for deep comparison (not ideal for performance but simple)
      JSON.stringify(value)
    ]);

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
  };
  state: {
    generatingSummary: boolean;
    generatingAnalysis: Record<string, boolean>;
  };
}

export const {
  Provider: AssessmentProvider,
  useContext: useAssessmentContext
} = createOptimizedContext<AssessmentContextType>();
