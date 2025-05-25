import { AssessmentData } from "@/types/assessment";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import { AnalysisStatus } from "@/firebase/services/assessment/types";
import { AnalysisProgress } from "./types";
import { evaluateWritingEnhanced } from "./steps/evaluateWritingEnhanced";
import { generateBasicInsightsEnhanced } from "./steps/generateBasicInsightsEnhanced";
import { generateAdvancedAnalysisEnhanced } from "./steps/generateAdvancedAnalysisEnhanced";

// Export the type for external use
export type { AnalysisProgress } from "./types";

/**
 * Enhanced automatic analysis with AI fallback
 */
export const initiateAutomaticAnalysisEnhanced = async (
  assessmentId: string,
  assessmentData: AssessmentData
): Promise<AnalysisProgress> => {
  console.log(`Starting enhanced automatic analysis for assessment ${assessmentId}`);
  
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

    // Enhanced Step 1: Evaluate writing responses
    let updatedData = await evaluateWritingEnhanced(assessmentId, assessmentData, progress);
    if (!updatedData) {
      throw new Error("Enhanced writing evaluation failed");
    }
    
    // Enhanced Step 2: Generate basic insights
    updatedData = await generateBasicInsightsEnhanced(assessmentId, updatedData, progress);
    if (!updatedData) {
      throw new Error("Enhanced basic insights generation failed");
    }

    // Enhanced Step 3: Start advanced analysis (non-blocking)
    const dataForAdvanced = JSON.parse(JSON.stringify(updatedData));
    generateAdvancedAnalysisEnhanced(assessmentId, dataForAdvanced, progress).catch(error => {
      console.error("Enhanced advanced analysis failed but continuing:", error);
    });

    // Update status to completed for basic analysis
    progress.status = 'basic_insights_generated';
    await updateAssessmentAnalysis(assessmentId, {
      analysisStatus: progress.status
    });
    
    console.log(`Enhanced automatic analysis completed successfully for ${assessmentId}`);
    return progress;
  } catch (error: any) {
    console.error(`Enhanced automatic analysis failed for assessment ${assessmentId}:`, error);
    
    // Update status to failed
    progress.status = 'failed';
    progress.error = error.message || "Unknown error in enhanced analysis";
    
    try {
      await updateAssessmentAnalysis(assessmentId, {
        analysisStatus: 'failed' as AnalysisStatus,
        analysisError: progress.error
      });
    } catch (updateError) {
      console.error("Failed to update enhanced analysis status:", updateError);
    }
    
    return progress;
  }
};
