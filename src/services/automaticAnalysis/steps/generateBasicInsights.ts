
import { AssessmentData } from "@/types/assessment";
import { generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/gemini";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import { AnalysisProgress } from "../types";

/**
 * Step 2: Generate basic insights (summary, strengths, weaknesses)
 */
export const generateBasicInsights = async (
  assessmentId: string,
  data: AssessmentData,
  progress: AnalysisProgress
): Promise<AssessmentData | null> => {
  try {
    console.log(`Generating basic insights for assessment ${assessmentId}`);
    
    if (!data.writingScores || data.writingScores.length === 0) {
      throw new Error("No writing scores available for insights generation");
    }
    
    // Generate summary and analysis in parallel with retry logic
    let summary: string | null = null;
    let analysis: { strengths: string[], weaknesses: string[] } | null = null;
    let retries = 0;
    const maxRetries = 2;
    
    while (retries <= maxRetries) {
      try {
        console.log(`Attempt ${retries + 1} to generate insights`);
        [summary, analysis] = await Promise.all([
          generateCandidateSummary(data),
          generateStrengthsAndWeaknesses(data)
        ]);
        break; // If successful, exit retry loop
      } catch (attemptError: any) {
        retries++;
        console.error(`Attempt ${retries} failed:`, attemptError);
        
        if (retries > maxRetries) {
          throw attemptError; // Rethrow if we've exhausted retries
        }
        
        // Wait before retrying (exponential backoff)
        const waitTime = Math.min(2000 * Math.pow(2, retries), 10000);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    if (!summary || !analysis || !analysis.strengths || !analysis.weaknesses) {
      throw new Error("Failed to generate complete insights");
    }

    console.log("Basic insights generated successfully");

    // Update assessment with insights
    const updateData = {
      aiSummary: summary,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses
    };
    
    await updateAssessmentAnalysis(assessmentId, updateData);
    
    // Update progress
    progress.completedSteps.push('basic_insights');
    
    // Return updated data
    return {
      ...data,
      ...updateData
    };
  } catch (error: any) {
    console.error(`Basic insights generation failed:`, error);
    progress.error = `Basic insights: ${error.message}`;
    progress.failedSteps.push('basic_insights');
    return null;
  }
};
