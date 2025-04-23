
import { AssessmentData } from "@/hooks/useAssessmentView";

export const useAptitudeCategories = (assessmentData: AssessmentData | null) => {
  const generateAptitudeCategories = (data: AssessmentData): AssessmentData => {
    const updatedData = { ...data };
    
    const shouldRegenerateCategories = 
      !updatedData.aptitudeCategories || 
      !Array.isArray(updatedData.aptitudeCategories) || 
      updatedData.aptitudeCategories.length === 0 ||
      updatedData.aptitudeCategories.some(cat => cat.source === "Generated" || cat.source === "Sample Data");

    if (shouldRegenerateCategories) {
      console.log("Generating accurate aptitude categories based on actual score...");
      
      const totalQuestions = updatedData.aptitudeTotal;
      const correctAnswers = updatedData.aptitudeScore;
      
      const logicalTotal = Math.ceil(totalQuestions * 0.3);
      const numericalTotal = Math.ceil(totalQuestions * 0.25);
      const verbalTotal = Math.ceil(totalQuestions * 0.25);
      const problemSolvingTotal = totalQuestions - logicalTotal - numericalTotal - verbalTotal;
      
      let remaining = correctAnswers;
      const logicalCorrect = Math.min(Math.floor(remaining * (logicalTotal / totalQuestions)), logicalTotal);
      remaining -= logicalCorrect;
      
      const numericalCorrect = Math.min(Math.floor(remaining * (numericalTotal / (totalQuestions - logicalTotal))), numericalTotal);
      remaining -= numericalCorrect;
      
      const verbalCorrect = Math.min(Math.floor(remaining * (verbalTotal / (totalQuestions - logicalTotal - numericalTotal))), verbalTotal);
      remaining -= verbalCorrect;
      
      const problemSolvingCorrect = Math.min(remaining, problemSolvingTotal);
      
      updatedData.aptitudeCategories = [
        { name: "Logical Reasoning", correct: logicalCorrect, total: logicalTotal, source: "System" },
        { name: "Numerical Analysis", correct: numericalCorrect, total: numericalTotal, source: "System" },
        { name: "Verbal Comprehension", correct: verbalCorrect, total: verbalTotal, source: "System" },
        { name: "Problem Solving", correct: problemSolvingCorrect, total: problemSolvingTotal, source: "System" }
      ];
    }

    return updatedData;
  };

  return { generateAptitudeCategories };
};
