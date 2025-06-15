
// This file now re-exports the unified analysis service for backward compatibility
import { unifiedAnalysisService } from './analysis/UnifiedAnalysisService';

export { unifiedAnalysisService as automaticAnalysisService } from './analysis/UnifiedAnalysisService';
export { unifiedAnalysisService } from './analysis/UnifiedAnalysisService';
export type { AnalysisProgress, AnalysisRequest } from './analysis/UnifiedAnalysisService';

// Legacy function mapping for backward compatibility
export const initiateAutomaticAnalysis = (assessmentId: string, assessmentData: any) => {
  return unifiedAnalysisService.analyzeAssessment({
    assessmentId,
    assessmentData,
    priority: 'normal'
  });
};
