
import { AssessmentData } from "@/types/assessment";

/**
 * Combines data processing functions to enrich the assessment data
 */
export const enrichAssessmentData = (
  assessment: AssessmentData,
  recoverAptitudeScore: (data: AssessmentData) => AssessmentData,
  generateAptitudeCategories: (data: AssessmentData) => AssessmentData
): AssessmentData => {
  if (!assessment) return assessment;
  
  // Apply each data enrichment function in sequence
  let updatedData = recoverAptitudeScore(assessment);
  updatedData = generateAptitudeCategories(updatedData);
  
  return updatedData;
};

/**
 * Creates a deep copy of assessment data
 */
export const createAssessmentCopy = (assessment: AssessmentData): AssessmentData => {
  return JSON.parse(JSON.stringify(assessment));
};
