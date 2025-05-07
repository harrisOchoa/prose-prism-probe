
import { AssessmentData } from "@/types/assessment";

export type AssessmentStatus = 'active' | 'completed' | 'archived';

export interface AssessmentWithStatus extends AssessmentData {
  status: AssessmentStatus;
}

/**
 * Determines the status of an assessment based on its properties
 * @param assessment The assessment data
 * @returns The assessment status (active, completed, or archived)
 */
export const determineAssessmentStatus = (assessment: AssessmentData): AssessmentStatus => {
  // Check if assessment is recent (< 24 hours) and not fully analyzed
  const submittedAt = assessment.submittedAt?.toDate?.() ?? new Date();
  const isRecent = (Date.now() - submittedAt.getTime()) < 24 * 60 * 60 * 1000;
  const isFullyAnalyzed = assessment.analysisStatus === 'completed';
  
  if (isRecent && !isFullyAnalyzed) {
    return 'active';
  } else if (assessment.analysisStatus === 'failed' || 
            (assessment.submittedAt && 
             submittedAt.getTime() < Date.now() - 90 * 24 * 60 * 60 * 1000)) {
    // Mark as archived if analysis failed or older than 90 days
    return 'archived';
  }
  
  return 'completed';
};

/**
 * Adds status property to assessment data objects
 * @param assessments Array of assessment data objects
 * @returns Array of assessments with status property
 */
export const addStatusToAssessments = (assessments: AssessmentData[]): AssessmentWithStatus[] => {
  return assessments.map(assessment => ({
    ...assessment,
    status: determineAssessmentStatus(assessment)
  })) as AssessmentWithStatus[];
};

/**
 * Count assessments by status
 * @param assessments Array of assessments with status
 * @returns Object containing counts by status
 */
export const countAssessmentsByStatus = (assessments: AssessmentWithStatus[]) => {
  return {
    active: assessments.filter(a => a.status === 'active').length,
    completed: assessments.filter(a => a.status === 'completed').length,
    archived: assessments.filter(a => a.status === 'archived').length,
    total: assessments.length
  };
};
