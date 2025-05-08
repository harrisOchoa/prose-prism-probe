
import { WritingPromptItem } from "@/components/AssessmentManager";
import { AntiCheatingMetrics } from './types';
import { WritingScore } from '@/services/geminiService';
import { sanitizeMetricsForFirestore } from './utils/metricsSanitizer';
import { checkExistingSubmission } from './utils/duplicateChecker';
import { createSubmission } from './utils/submissionCreator';

/**
 * Saves an assessment result to Firestore
 * Handles duplicate checking and creates new submission when needed
 */
export const saveAssessmentResult = async (
  candidateName: string,
  candidatePosition: string,
  completedPrompts: WritingPromptItem[],
  aptitudeScore: number,
  aptitudeTotal: number,
  writingScores?: WritingScore[],
  antiCheatingMetrics?: AntiCheatingMetrics
): Promise<string> => {
  try {
    if (!candidateName || !candidatePosition) {
      console.error("Missing required fields for assessment submission:", { candidateName, candidatePosition });
      throw new Error('Missing required candidate information');
    }

    console.log("Starting assessment submission for:", candidateName);
    console.log("Position:", candidatePosition);
    console.log("Aptitude score:", aptitudeScore, "out of", aptitudeTotal);
    console.log("Completed prompts:", completedPrompts.length);
    console.log("Original metrics provided:", antiCheatingMetrics);
    
    // Check for existing submission for this candidate and position
    const existingId = await checkExistingSubmission(candidateName, candidatePosition);
    if (existingId) {
      return existingId;
    }
    
    // No match found, sanitize metrics and create new assessment
    const sanitizedMetrics = sanitizeMetricsForFirestore(antiCheatingMetrics);
    console.log("Sanitized metrics:", sanitizedMetrics);
    
    // Create new submission
    return await createSubmission(
      candidateName,
      candidatePosition, 
      completedPrompts,
      aptitudeScore,
      aptitudeTotal,
      sanitizedMetrics,
      writingScores
    );
  } catch (error) {
    console.error('Error saving assessment:', error);
    throw new Error('Failed to save assessment results: ' + (error instanceof Error ? error.message : String(error)));
  }
};
