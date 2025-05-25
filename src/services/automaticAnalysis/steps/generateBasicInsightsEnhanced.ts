
import { AssessmentData } from "@/types/assessment";
import { generateCandidateSummaryEnhanced, generateStrengthsAndWeaknessesEnhanced } from "@/services/geminiEnhanced";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import { AnalysisProgress } from "../types";

/**
 * Enhanced Step 2: Generate basic insights with AI fallback
 */
export const generateBasicInsightsEnhanced = async (
  assessmentId: string,
  data: AssessmentData,
  progress: AnalysisProgress
): Promise<AssessmentData | null> => {
  try {
    console.log(`Enhanced basic insights generation for assessment ${assessmentId}`);
    
    if (!data.writingScores || data.writingScores.length === 0) {
      throw new Error("No writing scores available for insights generation");
    }
    
    // Generate summary and analysis with enhanced fallback
    console.log("Generating summary and strengths/weaknesses with AI fallback...");
    const [summary, analysis] = await Promise.all([
      generateCandidateSummaryEnhanced(data),
      generateStrengthsAndWeaknessesEnhanced(data)
    ]);
    
    if (!summary || !analysis || !analysis.strengths || !analysis.weaknesses) {
      throw new Error("Failed to generate complete enhanced insights");
    }

    console.log("Enhanced basic insights generated successfully");

    // Update assessment with insights
    const updateData = {
      aiSummary: summary,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses
    };
    
    await updateAssessmentAnalysis(assessmentId, updateData);
    
    // Update progress
    progress.completedSteps.push('basic_insights_enhanced');
    
    // Return updated data
    return {
      ...data,
      ...updateData
    };
  } catch (error: any) {
    console.error(`Enhanced basic insights generation failed:`, error);
    progress.error = `Enhanced basic insights: ${error.message}`;
    progress.failedSteps.push('basic_insights_enhanced');
    return null;
  }
};
