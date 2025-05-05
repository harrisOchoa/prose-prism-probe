
import { doc, runTransaction, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config';
import { AssessmentSubmission } from './types';

export const updateAssessmentAnalysis = async (
  assessmentId: string,
  analysisData: Partial<AssessmentSubmission>
): Promise<boolean> => {
  try {
    console.log(`[${new Date().toISOString()}] Updating assessment ${assessmentId} with data:`, analysisData);
    const assessmentRef = doc(db, 'assessments', assessmentId);
    
    // First check if document exists
    const docSnapshot = await getDoc(assessmentRef);
    if (!docSnapshot.exists()) {
      console.error(`Assessment document ${assessmentId} not found`);
      throw new Error(`Assessment document ${assessmentId} not found`);
    }
    
    // Special handling for data to prevent overwriting with empty values
    const existingData = docSnapshot.data();
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
    console.log(`Updating fields:`, Object.keys(updateData));
    
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
      return true; // Return true since technically it's already up to date
    }
    
    // Use direct update instead of transaction for simpler code and fewer retries
    await updateDoc(assessmentRef, updateData);
    console.log(`Successfully updated assessment ${assessmentId}`);
    
    // Verify the update
    const verificationDoc = await getDoc(assessmentRef);
    if (verificationDoc.exists()) {
      const data = verificationDoc.data();
      
      // Verify key fields were actually updated
      let updateSuccessful = true;
      
      // Only check fields that were in the update
      if (updateData.aiSummary && data.aiSummary !== updateData.aiSummary) {
        console.warn("aiSummary wasn't saved correctly");
        updateSuccessful = false;
      }
      
      if (updateData.strengths && (!data.strengths || data.strengths.length !== updateData.strengths.length)) {
        console.warn("strengths weren't saved correctly");
        updateSuccessful = false;
      }
      
      if (updateData.weaknesses && (!data.weaknesses || data.weaknesses.length !== updateData.weaknesses.length)) {
        console.warn("weaknesses weren't saved correctly");
        updateSuccessful = false;
      }
      
      // Advanced analysis fields verification
      if (updateData.detailedWritingAnalysis && !data.detailedWritingAnalysis) {
        console.warn("detailedWritingAnalysis wasn't saved");
        updateSuccessful = false;
      }
      
      if (updateData.personalityInsights && (!data.personalityInsights || data.personalityInsights.length !== updateData.personalityInsights.length)) {
        console.warn("personalityInsights weren't saved correctly");
        updateSuccessful = false;
      }
      
      if (updateData.interviewQuestions && (!data.interviewQuestions || data.interviewQuestions.length !== updateData.interviewQuestions.length)) {
        console.warn("interviewQuestions weren't saved correctly");
        updateSuccessful = false;
      }
      
      if (updateData.profileMatch && !data.profileMatch) {
        console.warn("profileMatch wasn't saved correctly"); 
        updateSuccessful = false;
      }
      
      if (updateData.aptitudeAnalysis && !data.aptitudeAnalysis) {
        console.warn("aptitudeAnalysis wasn't saved correctly");
        updateSuccessful = false;
      }
      
      if (updateSuccessful) {
        console.log(`Successfully verified update to assessment ${assessmentId}`);
      } else {
        console.error(`Update verification failed for assessment ${assessmentId}`);
        // Try one more direct update if verification failed
        await updateDoc(assessmentRef, updateData);
        console.log(`Attempted a second update for assessment ${assessmentId}`);
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
