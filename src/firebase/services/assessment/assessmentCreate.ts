
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
    const recentSubmissionsQuery = query(
      collection(db, 'assessments'),
      where('candidateName', '==', candidateName),
      where('candidatePosition', '==', candidatePosition)
    );
    
    const querySnapshot = await getDocs(recentSubmissionsQuery);
    const recentSubmissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as AssessmentSubmission
    }));
    
    const now = new Date();
    const potentialDuplicates = recentSubmissions.filter(submission => {
      if (submission.submittedAt && submission.submittedAt.toDate) {
        const submissionTime = submission.submittedAt.toDate();
        const timeDiffSeconds = (now.getTime() - submissionTime.getTime()) / 1000;
        return timeDiffSeconds < 60 && 
               submission.aptitudeScore === aptitudeScore && 
               submission.aptitudeTotal === aptitudeTotal;
      }
      return false;
    });
    
    if (potentialDuplicates.length > 0) {
      console.log("Potential duplicate submission detected, using existing record ID:", potentialDuplicates[0].id);
      return potentialDuplicates[0].id;
    }
    
    const wordCount = completedPrompts.reduce((total, prompt) => total + prompt.wordCount, 0);
    
    let overallWritingScore;
    if (writingScores && writingScores.length > 0) {
      const totalScore = writingScores.reduce((sum, evaluation) => sum + evaluation.score, 0);
      overallWritingScore = Number((totalScore / writingScores.length).toFixed(1));
    }
    
    console.log("Saving assessment with aptitude score:", aptitudeScore);
    console.log("Saving assessment with metrics:", antiCheatingMetrics);
    
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
    
    console.log("Final submission object:", submission);
    
    const docRef = await addDoc(collection(db, 'assessments'), submission);
    console.log("Assessment saved with ID:", docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving assessment:', error);
    throw new Error('Failed to save assessment results');
  }
};
