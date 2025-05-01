
import { AssessmentData } from "@/types/assessment";

export const useAptitudeRecovery = (assessmentData: AssessmentData | null) => {
  const recoverAptitudeScore = (data: AssessmentData): AssessmentData => {
    const updatedData = { ...data };
    
    if (updatedData.aptitudeScore === undefined || updatedData.aptitudeScore === null) {
      console.log("Aptitude score is missing, attempting recovery...");
      
      if (updatedData.aptitudeAnswers && Array.isArray(updatedData.aptitudeAnswers)) {
        console.log("Recovery attempt from aptitudeAnswers:", updatedData.aptitudeAnswers);
        const correctAnswerIndices = updatedData.aptitudeData?.correctAnswers;
        
        if (correctAnswerIndices) {
          console.log(`Using provided correct answers count: ${correctAnswerIndices}`);
          updatedData.aptitudeScore = correctAnswerIndices;
        } else {
          const recoveredScore = updatedData.aptitudeAnswers.filter(a => a !== 0).length;
          console.log(`Calculated score from non-zero answers: ${recoveredScore}`);
          updatedData.aptitudeScore = recoveredScore;
        }
      } else if (updatedData.aptitudeData?.correctAnswers !== undefined) {
        console.log(`Recovering aptitude score from aptitudeData.correctAnswers:`, updatedData.aptitudeData.correctAnswers);
        updatedData.aptitudeScore = updatedData.aptitudeData.correctAnswers;
      } else {
        console.log("No aptitude data available for recovery, defaulting to 0");
        updatedData.aptitudeScore = 0;
      }
    }

    if (updatedData.aptitudeTotal === undefined || updatedData.aptitudeTotal === null) {
      console.log("Aptitude total is missing, setting default value");
      updatedData.aptitudeTotal = 30;
    }

    return updatedData;
  };

  return { recoverAptitudeScore };
};
