
/**
 * Type definitions for the advanced analysis state
 */

export interface AnalysisStateMap {
  writing: boolean;
  personality: boolean;
  interview: boolean;
  questions: boolean;
  profile: boolean;
  aptitude: boolean;
  [key: string]: boolean; // Add index signature to allow arbitrary string keys
}
