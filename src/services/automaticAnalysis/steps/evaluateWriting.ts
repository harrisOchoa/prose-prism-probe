
import { AssessmentData } from "@/types/assessment";
import { evaluateAllWritingPrompts } from "@/services/gemini";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import { AnalysisStatus } from "@/firebase/services/assessment/types";
import { AnalysisProgress } from "../types";

/**
 * Step 1: Evaluate writing responses
 */
export const evaluateWriting = async (
  assessmentId: string,
  data: AssessmentData,
  progress: AnalysisProgress
): Promise<AssessmentData | null> => {
  try {
    console.log(`Evaluating writing for assessment ${assessmentId}`);
    
    if (!data.completedPrompts || data.completedPrompts.length === 0) {
      throw new Error("No writing prompts to evaluate");
    }

    // Evaluate all writing prompts
    const scores = await evaluateAllWritingPrompts(data.completedPrompts);
    
    if (!scores || scores.length === 0) {
      throw new Error("No scores returned from writing evaluation");
    }

    const validScores = scores.filter(score => score.score > 0);
    
    if (validScores.length === 0) {
      throw new Error("No valid scores generated from writing evaluation");
    }
    
    // Calculate overall score
    const overallScore = validScores.length > 0
      ? Number((validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length).toFixed(1))
      : 0;

    console.log(`Writing evaluation complete: ${validScores.length}/${scores.length} valid scores, overall: ${overallScore}`);
    
    // Update assessment with scores
    const updateData = {
      writingScores: scores,
      overallWritingScore: overallScore,
      analysisStatus: 'writing_evaluated' as AnalysisStatus
    };
    
    await updateAssessmentAnalysis(assessmentId, updateData);
    
    // Update progress
    progress.status = 'writing_evaluated';
    progress.completedSteps.push('writing_evaluation');
    
    // Return updated data
    return {
      ...data,
      ...updateData
    };
  } catch (error: any) {
    console.error(`Writing evaluation failed:`, error);
    progress.status = 'failed';
    progress.error = `Writing evaluation: ${error.message}`;
    progress.failedSteps.push('writing_evaluation');
    return null;
  }
};
