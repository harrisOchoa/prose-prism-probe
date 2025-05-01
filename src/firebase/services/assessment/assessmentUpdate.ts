
import { doc, runTransaction, getDoc } from 'firebase/firestore';
import { db } from '../../config';
import { AssessmentSubmission } from './types';

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
    const verificationDoc = await getDoc(doc(db, "assessments", assessmentId));
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
