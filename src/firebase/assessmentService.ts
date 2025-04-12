
import { db } from './config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { WritingPromptItem } from '@/components/AssessmentManager';
import { AptitudeQuestion } from '@/utils/aptitudeQuestions';

interface AssessmentSubmission {
  candidateName: string;
  candidatePosition: string;
  aptitudeScore: number;
  aptitudeTotal: number;
  completedPrompts: WritingPromptItem[];
  wordCount: number;
  submittedAt: any;
}

export const saveAssessmentResult = async (
  candidateName: string,
  candidatePosition: string,
  completedPrompts: WritingPromptItem[],
  aptitudeScore: number,
  aptitudeTotal: number
): Promise<string> => {
  try {
    // Calculate the total word count
    const wordCount = completedPrompts.reduce((total, prompt) => total + prompt.wordCount, 0);
    
    // Create the submission object
    const submission: AssessmentSubmission = {
      candidateName,
      candidatePosition,
      aptitudeScore,
      aptitudeTotal,
      completedPrompts,
      wordCount,
      submittedAt: serverTimestamp()
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, 'assessments'), submission);
    return docRef.id;
  } catch (error) {
    console.error('Error saving assessment:', error);
    throw new Error('Failed to save assessment results');
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
