
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../../config';

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
