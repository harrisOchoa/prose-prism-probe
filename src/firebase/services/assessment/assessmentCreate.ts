
import { collection, addDoc, serverTimestamp, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../../config';
import { AntiCheatingMetrics, AssessmentSubmission } from './types';
import { WritingScore } from '@/services/geminiService';
import { WritingPromptItem } from '@/components/AssessmentManager';

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
    // Check for recent submissions to avoid duplicates
    const recentSubmissionsQuery = query(
      collection(db, 'assessments'),
      where('candidateName', '==', candidateName),
      where('candidatePosition', '==', candidatePosition)
    );
    
    const querySnapshot = await getDocs(recentSubmissionsQuery);
    
    // Extract all existing submissions for this candidate
    const recentSubmissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as AssessmentSubmission
    }));
    
    console.log(`Found ${recentSubmissions.length} existing submissions for ${candidateName}`);
    
    const now = new Date();
    const potentialDuplicates = recentSubmissions.filter(submission => {
      if (submission.submittedAt && submission.submittedAt.toDate) {
        const submissionTime = submission.submittedAt.toDate();
        // More stringent duplicate detection:
        // 1. Submitted within the last 30 minutes
        // 2. Same aptitude score and total
        // 3. Similar word count (within 10% variance)
        const timeDiffMinutes = (now.getTime() - submissionTime.getTime()) / (60 * 1000);
        const wordCount = completedPrompts.reduce((total, prompt) => total + prompt.wordCount, 0);
        
        const similarAptitudeScore = submission.aptitudeScore === aptitudeScore;
        const similarAptitudeTotal = submission.aptitudeTotal === aptitudeTotal;
        
        // If word counts within 10% of each other - indicates same submission
        let similarWordCount = false;
        if (submission.wordCount && wordCount) {
          const wordCountDiffPercent = Math.abs(submission.wordCount - wordCount) / Math.max(submission.wordCount, wordCount);
          similarWordCount = wordCountDiffPercent < 0.1; // Within 10% difference
        }
        
        return timeDiffMinutes < 30 && 
               similarAptitudeScore && 
               similarAptitudeTotal &&
               similarWordCount;
      }
      return false;
    });
    
    if (potentialDuplicates.length > 0) {
      console.log("Detected duplicate submission for:", candidateName);
      console.log("Using existing record ID:", potentialDuplicates[0].id);
      console.log("Time since original submission:", potentialDuplicates[0].submittedAt.toDate ? 
        Math.round((now.getTime() - potentialDuplicates[0].submittedAt.toDate().getTime()) / (60 * 1000)) + " minutes" : "unknown");
      return potentialDuplicates[0].id;
    }
    
    const wordCount = completedPrompts.reduce((total, prompt) => total + prompt.wordCount, 0);
    
    let overallWritingScore;
    if (writingScores && writingScores.length > 0) {
      const totalScore = writingScores.reduce((sum, evaluation) => sum + evaluation.score, 0);
      overallWritingScore = Number((totalScore / writingScores.length).toFixed(1));
    }
    
    console.log("Saving new assessment for:", candidateName);
    console.log("Aptitude score:", aptitudeScore);
    console.log("Anti-cheating metrics present:", !!antiCheatingMetrics);
    
    const submission: AssessmentSubmission = {
      candidateName,
      candidatePosition,
      aptitudeScore,
      aptitudeTotal,
      completedPrompts,
      wordCount,
      submittedAt: serverTimestamp(),
      antiCheatingMetrics: antiCheatingMetrics || null
    };

    if (writingScores && writingScores.length > 0) {
      submission.writingScores = writingScores;
      submission.overallWritingScore = overallWritingScore;
    }
    
    const docRef = await addDoc(collection(db, 'assessments'), submission);
    console.log("New assessment saved with ID:", docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving assessment:', error);
    throw new Error('Failed to save assessment results');
  }
};
