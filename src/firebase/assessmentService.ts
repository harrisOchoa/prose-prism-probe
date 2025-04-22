
import { db } from './config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, DocumentData, updateDoc, doc } from 'firebase/firestore';
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
    const wordCount = completedPrompts.reduce((total, prompt) => total + prompt.wordCount, 0);
    
    let overallWritingScore;
    if (writingScores && writingScores.length > 0) {
      const totalScore = writingScores.reduce((sum, evaluation) => sum + evaluation.score, 0);
      overallWritingScore = Number((totalScore / writingScores.length).toFixed(1));
    }
    
    // Log the submission data and metrics before saving
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
    
    // Log the final submission object
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
    const assessmentRef = doc(db, 'assessments', assessmentId);
    await updateDoc(assessmentRef, analysisData);
    return true;
  } catch (error) {
    console.error('Error updating assessment analysis:', error);
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
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching all assessments:', error);
    throw new Error('Failed to fetch all assessments');
  }
};
