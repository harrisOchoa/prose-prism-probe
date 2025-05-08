
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../config';

/**
 * Checks for existing assessment submissions with the same candidate name
 * Returns the first matching document id if found, null otherwise
 */
export const checkExistingSubmission = async (
  candidateName: string,
  candidatePosition: string
): Promise<string | null> => {
  // Generate normalized versions of candidate name and position to avoid case/whitespace duplicates
  const normalizedName = candidateName.toLowerCase().trim();
  const normalizedPosition = candidatePosition.toLowerCase().trim();
  
  // First check by candidateName only (more common, less likely to need index)
  const nameCandidateQuery = query(
    collection(db, 'assessments'),
    where('candidateName', '==', candidateName),
    limit(10)
  );
  
  console.log(`Checking for existing submissions for ${candidateName}...`);
  const nameQuerySnapshot = await getDocs(nameCandidateQuery);
  
  // If we find results for the name, filter in memory for the position match
  if (!nameQuerySnapshot.empty) {
    console.log(`Found ${nameQuerySnapshot.docs.length} submissions with name ${candidateName}`);
    // Filter in memory by position
    const matchingDocs = nameQuerySnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.candidatePosition === candidatePosition;
    });
    
    if (matchingDocs.length > 0) {
      console.log(`Found ${matchingDocs.length} existing submissions for ${candidateName} as ${candidatePosition}`);
      const mostRecentDoc = matchingDocs[0]; // Just use first match since we can't sort in memory easily
      console.log("Using existing assessment with ID:", mostRecentDoc.id);
      return mostRecentDoc.id;
    }
  }
  
  return null;
};
