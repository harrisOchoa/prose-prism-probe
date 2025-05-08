
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config';
import { AntiCheatingMetrics, AssessmentSubmission } from '../types';
import { WritingScore } from '@/services/geminiService';
import { WritingPromptItem } from '@/components/AssessmentManager';

/**
 * Creates a new assessment submission in Firestore
 * Returns the document ID of the created submission
 */
export const createSubmission = async (
  candidateName: string,
  candidatePosition: string,
  completedPrompts: WritingPromptItem[],
  aptitudeScore: number,
  aptitudeTotal: number,
  sanitizedMetrics: AntiCheatingMetrics | null,
  writingScores?: WritingScore[]
): Promise<string> => {
  // Generate normalized versions
  const normalizedName = candidateName.toLowerCase().trim();
  const normalizedPosition = candidatePosition.toLowerCase().trim();
  
  // Calculate word count
  const wordCount = completedPrompts.reduce((total, prompt) => total + prompt.wordCount, 0);
  
  console.log("Saving new assessment for:", candidateName);
  console.log("Aptitude score:", aptitudeScore);
  console.log("Word count:", wordCount);
  
  // Calculate overall writing score if available
  let overallWritingScore;
  if (writingScores && writingScores.length > 0) {
    const totalScore = writingScores.reduce((sum, evaluation) => sum + evaluation.score, 0);
    overallWritingScore = Number((totalScore / writingScores.length).toFixed(1));
  }
  
  // Create submission object
  const submission: AssessmentSubmission = {
    candidateName,
    candidatePosition,
    candidateNameNormalized: normalizedName,
    candidatePositionNormalized: normalizedPosition,
    aptitudeScore,
    aptitudeTotal,
    completedPrompts,
    wordCount,
    submittedAt: serverTimestamp(),
    antiCheatingMetrics: sanitizedMetrics,
    submissionId: `${normalizedName}-${normalizedPosition}-${Date.now()}`
  };

  // Add writing scores if available
  if (writingScores && writingScores.length > 0) {
    submission.writingScores = writingScores;
    submission.overallWritingScore = overallWritingScore;
  }
  
  console.log("Attempting to add document to Firestore...");
  console.log("Final submission object properties:", Object.keys(submission));
  
  // Create document in Firestore
  const docRef = await addDoc(collection(db, 'assessments'), submission);
  console.log("New assessment saved with ID:", docRef.id);
  
  return docRef.id;
};
