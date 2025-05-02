
import { doc, runTransaction, getDoc } from 'firebase/firestore';
import { db } from '../../config';
import { AssessmentSubmission } from './types';

export const updateAssessmentAnalysis = async (
  assessmentId: string,
  analysisData: Partial<AssessmentSubmission>
): Promise<boolean> => {
  try {
    console.log(`[${new Date().toISOString()}] Updating assessment ${assessmentId} with data:`, analysisData);
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
      
      // Print what's being updated for debugging
      console.log(`Transaction prepared: updating fields:`, Object.keys(updateData));
      
      // Check if existing data already has these values to prevent redundant updates
      let hasChanges = false;
      for (const [key, value] of Object.entries(updateData)) {
        if (JSON.stringify(existingData[key]) !== JSON.stringify(value)) {
          hasChanges = true;
          break;
        }
      }
      
      if (!hasChanges) {
        console.log("No changes detected, skipping update");
        return;
      }
      
      transaction.update(assessmentRef, updateData);
      console.log(`Transaction committed to update assessment ${assessmentId}`);
    });
    
    // Verify the update
    const verificationDoc = await getDoc(doc(db, "assessments", assessmentId));
    if (verificationDoc.exists()) {
      const data = verificationDoc.data();
      
      // Verify key fields were actually updated
      let updateSuccessful = true;
      if (analysisData.aiSummary && data.aiSummary !== analysisData.aiSummary) {
        console.warn("aiSummary wasn't saved correctly");
        updateSuccessful = false;
      }
      
      if (analysisData.strengths && (!data.strengths || data.strengths.length !== analysisData.strengths.length)) {
        console.warn("strengths weren't saved correctly");
        updateSuccessful = false;
      }
      
      if (analysisData.weaknesses && (!data.weaknesses || data.weaknesses.length !== analysisData.weaknesses.length)) {
        console.warn("weaknesses weren't saved correctly");
        updateSuccessful = false;
      }
      
      if (updateSuccessful) {
        console.log(`Successfully verified update to assessment ${assessmentId}`);
      } else {
        console.error(`Update verification failed for assessment ${assessmentId}`);
      }
      
      return updateSuccessful;
    } else {
      console.error(`Assessment ${assessmentId} not found after update attempt`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating assessment ${assessmentId}:`, error);
    throw new Error('Failed to update assessment analysis');
  }
};
