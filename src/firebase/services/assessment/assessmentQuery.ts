
import { collection, query, where, getDocs, DocumentData, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config';

// Add this new function to get a single assessment by ID
export const getAssessmentById = async (id: string): Promise<DocumentData | null> => {
  try {
    const docRef = doc(db, 'assessments', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      console.log(`Assessment with ID ${id} not found`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching assessment by ID:', error);
    throw new Error(`Failed to fetch assessment with ID ${id}`);
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
