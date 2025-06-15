
import { lazy } from 'react';

// Lazy load heavy tab components for better performance
export const LazyOverviewTab = lazy(() => 
  import('../OverviewTab').then(module => ({ default: module.default }))
);

export const LazyAptitudeTab = lazy(() => 
  import('../AptitudeTab').then(module => ({ default: module.AptitudeTab }))
);

export const LazyWritingTab = lazy(() => 
  import('../WritingTab').then(module => ({ default: module.default }))
);

export const LazyAdvancedAnalysisTab = lazy(() => 
  import('../../AdvancedAnalysisTab').then(module => ({ default: module.default }))
);

export const LazyCandidateComparison = lazy(() => 
  import('../ComparisonTab').then(module => ({ default: module.default }))
);
