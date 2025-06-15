
// Re-export unified analysis system for backward compatibility
export { unifiedAnalysisService as automaticAnalysisService } from '../analysis/UnifiedAnalysisService';
export { unifiedAnalysisService } from '../analysis/UnifiedAnalysisService';
export type { AnalysisProgress, AnalysisRequest } from '../analysis/UnifiedAnalysisService';

// Legacy function mapping
export const initiateAutomaticAnalysis = (assessmentId: string, assessmentData: any) => {
  return unifiedAnalysisService.analyzeAssessment({
    assessmentId,
    assessmentData,
    priority: 'normal'
  });
};
