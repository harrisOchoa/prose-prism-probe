
import { AssessmentData } from "@/types/assessment";
import { evaluateAllWritingPromptsEnhanced } from "@/services/geminiEnhanced";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import { AnalysisStatus } from "@/firebase/services/assessment/types";
import { AnalysisProgress } from "../types";

/**
 * Enhanced Step 1: Evaluate writing responses with AI fallback
 */
export const evaluateWritingEnhanced = async (
  assessmentId: string,
  data: AssessmentData,
  progress: AnalysisProgress
): Promise<AssessmentData | null> => {
  try {
    console.log(`Enhanced writing evaluation for assessment ${assessmentId}`);
    
    if (!data.completedPrompts || data.completedPrompts.length === 0) {
      throw new Error("No writing prompts to evaluate");
    }

    // Use enhanced evaluation with fallback
    const scores = await evaluateAllWritingPromptsEnhanced(data.completedPrompts);
    
    if (!scores || scores.length === 0) {
      throw new Error("No scores returned from enhanced writing evaluation");
    }

    const validScores = scores.filter(score => score.score > 0);
    
    if (validScores.length === 0) {
      throw new Error("No valid scores generated from enhanced writing evaluation");
    }
    
    // Calculate overall score
    const overallScore = validScores.length > 0
      ? Number((validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length).toFixed(1))
      : 0;

    console.log(`Enhanced writing evaluation complete: ${validScores.length}/${scores.length} valid scores, overall: ${overallScore}`);
    
    // Update assessment with scores
    const updateData = {
      writingScores: scores,
      overallWritingScore: overallScore,
      analysisStatus: 'writing_evaluated' as AnalysisStatus
    };
    
    await updateAssessmentAnalysis(assessmentId, updateData);
    
    // Update progress
    progress.status = 'writing_evaluated';
    progress.completedSteps.push('writing_evaluation_enhanced');
    
    // Return updated data
    return {
      ...data,
      ...updateData
    };
  } catch (error: any) {
    console.error(`Enhanced writing evaluation failed:`, error);
    progress.status = 'failed';
    progress.error = `Enhanced writing evaluation: ${error.message}`;
    progress.failedSteps.push('writing_evaluation_enhanced');
    return null;
  }
};
