import { lazy } from 'react';

// Lazy load optimized tab components with better error handling
export const LazyOptimizedOverviewTab = lazy(() => 
  import('../OptimizedOverviewTab').then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load OptimizedOverviewTab:', error);
      // Fallback to original component
      return import('../OverviewTab').then(module => ({ default: module.default }));
    })
);

export const LazyOptimizedAptitudeTab = lazy(() => 
  import('../OptimizedAptitudeTab').then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load OptimizedAptitudeTab:', error);
      // Fallback to original component
      return import('../AptitudeTab').then(module => ({ default: module.AptitudeTab }));
    })
);

// Keep existing lazy components for backward compatibility
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
