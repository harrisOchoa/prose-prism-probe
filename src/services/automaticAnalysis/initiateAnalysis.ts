
import { AssessmentData } from "@/types/assessment";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import { AnalysisStatus } from "@/firebase/services/assessment/types";
import { AnalysisProgress } from "./types";
import { evaluateWriting } from "./steps/evaluateWriting";
import { generateBasicInsights } from "./steps/generateBasicInsights";
import { generateAdvancedAnalysis } from "./steps/generateAdvancedAnalysis";

/**
 * Main function to initiate automatic analysis for an assessment
 */
export const initiateAutomaticAnalysis = async (
  assessmentId: string,
  assessmentData: AssessmentData
): Promise<AnalysisProgress> => {
  console.log(`Starting automatic analysis for assessment ${assessmentId}`);
  
  // Initialize progress
  const progress: AnalysisProgress = {
    status: 'pending',
    completedSteps: [],
    failedSteps: []
  };

  try {
    // Update status to pending
    await updateAssessmentAnalysis(assessmentId, {
      analysisStatus: 'pending' as AnalysisStatus
    });

    // Step 1: Evaluate writing responses
    let updatedData = await evaluateWriting(assessmentId, assessmentData, progress);
    if (!updatedData) {
      throw new Error("Writing evaluation failed");
    }
    
    // Step 2: Generate basic insights
    updatedData = await generateBasicInsights(assessmentId, updatedData, progress);
    if (!updatedData) {
      throw new Error("Basic insights generation failed");
    }

    // Step 3: Start advanced analysis (won't block completion)
    // We pass a copy to avoid reference issues
    const dataForAdvanced = JSON.parse(JSON.stringify(updatedData));
    generateAdvancedAnalysis(assessmentId, dataForAdvanced, progress).catch(error => {
      console.error("Advanced analysis failed but continuing:", error);
    });

    // Update status to completed for basic analysis
    progress.status = 'basic_insights_generated';
    await updateAssessmentAnalysis(assessmentId, {
      analysisStatus: progress.status
    });
    
    return progress;
  } catch (error: any) {
    console.error(`Automatic analysis failed for assessment ${assessmentId}:`, error);
    
    // Update status to failed
    progress.status = 'failed';
    progress.error = error.message || "Unknown error";
    
    try {
      await updateAssessmentAnalysis(assessmentId, {
        analysisStatus: 'failed' as AnalysisStatus,
        analysisError: progress.error
      });
    } catch (updateError) {
      console.error("Failed to update analysis status:", updateError);
    }
    
    return progress;
  }
};
