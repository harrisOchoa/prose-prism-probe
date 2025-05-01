
import { db } from './config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, DocumentData, updateDoc, doc, runTransaction, getDoc } from 'firebase/firestore';
import { WritingPromptItem } from '@/components/AssessmentManager';
import { WritingScore } from '@/services/geminiService';

export interface AntiCheatingMetrics {
  keystrokes: number;
  pauses: number;
  wordsPerMinute: number;  // Consistent naming
  tabSwitches: number;
  suspiciousActivity: boolean;
  copyAttempts?: number;
  pasteAttempts?: number;
  rightClickAttempts?: number;
  keyboardShortcuts?: number;
  windowBlurs?: number;
  windowFocuses?: number;
  suspiciousActivityDetail?: string;
}

export interface AssessmentSubmission {
  candidateName: string;
  candidatePosition: string;
  aptitudeScore: number;
  aptitudeTotal: number;
  completedPrompts: WritingPromptItem[];
  wordCount: number;
  writingScores?: WritingScore[];
  overallWritingScore?: number;
  submittedAt: any;
  aiSummary?: string;
  strengths?: string[];
  weaknesses?: string[];
  detailedWritingAnalysis?: any;
  personalityInsights?: any[];
  interviewQuestions?: any[];
  profileMatch?: any;
  antiCheatingMetrics?: AntiCheatingMetrics | null;
}

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

export const updateAssessmentAnalysis = async (
  assessmentId: string,
  analysisData: Partial<AssessmentSubmission>
): Promise<boolean> => {
  try {
    console.log(`Updating assessment ${assessmentId} with data:`, analysisData);
    const assessmentRef = doc(db, 'assessments', assessmentId);
    
    // Use a transaction for more reliable updates
    await runTransaction(db, async (transaction) => {
      const assessmentDoc = await transaction.get(assessmentRef);
      if (!assessmentDoc.exists()) {
        throw new Error(`Assessment document ${assessmentId} not found`);
      }
      
      // Merge the existing document data with the new analysis data
      const existingData = assessmentDoc.data();
      const updateData = { ...analysisData };
      
      // Special handling for arrays to prevent overwriting with empty arrays
      if (Array.isArray(updateData.strengths) && updateData.strengths.length === 0 && existingData.strengths && existingData.strengths.length > 0) {
        delete updateData.strengths;
      }
      
      if (Array.isArray(updateData.weaknesses) && updateData.weaknesses.length === 0 && existingData.weaknesses && existingData.weaknesses.length > 0) {
        delete updateData.weaknesses;
      }
      
      if (Array.isArray(updateData.writingScores) && updateData.writingScores.length === 0 && existingData.writingScores && existingData.writingScores.length > 0) {
        delete updateData.writingScores;
      }
      
      // Don't update aiSummary if it would be set to empty string and there's an existing value
      if (updateData.aiSummary === "" && existingData.aiSummary) {
        delete updateData.aiSummary;
      }
      
      transaction.update(assessmentRef, updateData);
      console.log(`Transaction prepared to update assessment ${assessmentId} with data:`, updateData);
    });
    
    // Verify the update
    const verificationDoc = await getDoc(assessmentRef);
    if (verificationDoc.exists()) {
      console.log(`Successfully verified update to assessment ${assessmentId}:`, verificationDoc.data());
      return true;
    } else {
      console.error(`Assessment ${assessmentId} not found after update attempt`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating assessment ${assessmentId}:`, error);
    throw new Error('Failed to update assessment analysis');
  }
};

export const getAssessmentsByCandidate = async (candidateName: string): Promise<DocumentData[]> => {
  try {
    const q = query(collection(db, 'assessments'), where('candidateName', '==', candidateName));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching assessments:', error);
    throw new Error('Failed to fetch assessments');
  }
};

export const getAllAssessments = async (): Promise<DocumentData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'assessments'));
    
    const assessments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`Assessment ${doc.id} aptitude score: ${data.aptitudeScore}/${data.aptitudeTotal}`);
      return {
        id: doc.id,
        ...data
      };
    });
    
    return assessments;
  } catch (error) {
    console.error('Error fetching all assessments:', error);
    throw new Error('Failed to fetch all assessments');
  }
};
