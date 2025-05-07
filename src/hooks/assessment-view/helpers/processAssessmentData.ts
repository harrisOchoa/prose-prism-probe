
import { AssessmentData } from "@/types/assessment";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import { generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/geminiService";
import { toast } from "@/hooks/use-toast";
import { AnalysisStatus } from "@/firebase/services/assessment/types";

/**
 * Generate insights (summary, strengths, and weaknesses) for an assessment
 */
export const generateAssessmentInsights = async (
  assessmentData: AssessmentData
): Promise<AssessmentData | null> => {
  if (!assessmentData || !assessmentData.id) {
    console.error("Cannot generate insights: Invalid assessment data");
    return null;
  }

  try {
    console.log("Generating assessment insights...");
    
    const [summary, analysis] = await Promise.all([
      generateCandidateSummary(assessmentData),
      generateStrengthsAndWeaknesses(assessmentData)
    ]);

    const updateData = {
      aiSummary: summary,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      analysisStatus: 'basic_insights_generated' as AnalysisStatus
    };
    
    // Create a new object reference with updated data
    const updatedData = {
      ...assessmentData,
      ...updateData
    };
    
    // Update database in background
    await updateAssessmentAnalysis(updatedData.id, updateData);
    console.log("Auto-generated insights saved to assessment:", updatedData);
    
    return updatedData;
  } catch (error) {
    console.error("Error generating insights:", error);
    return null;
  }
};

/**
 * Process assessment data to check for missing insights and generate them if needed
 */
export const processAssessmentData = async (
  assessment: AssessmentData,
  setAssessment: (data: AssessmentData) => void,
  setGeneratingSummary: (generating: boolean) => void
): Promise<void> => {
  if (!assessment || !assessment.id) return;
  
  console.log(`[${new Date().toISOString()}] Processing assessment data:`, assessment.id);
  
  // Check analysis status
  const analysisStatus = assessment.analysisStatus;
  console.log(`Assessment analysis status: ${analysisStatus}`);
  
  // If writing scores exist but we're missing summary data and there's no ongoing analysis, generate it
  if (assessment.writingScores && 
      assessment.writingScores.length > 0 && 
      assessment.writingScores.some(score => score.score > 0) &&
      (!assessment.aiSummary || !assessment.strengths || !assessment.weaknesses) &&
      (!analysisStatus || analysisStatus === 'writing_evaluated' || analysisStatus === 'failed')) {
    
    console.log("Missing insights detected, attempting to generate");
    setGeneratingSummary(true);
    
    try {
      const updatedData = await generateAssessmentInsights(assessment);
      
      if (updatedData) {
        // Update state immediately with a new object reference to trigger rerender
        console.log("Local state updated with auto-generated insights");
        setAssessment(JSON.parse(JSON.stringify(updatedData)));
      }
    } catch (aiError) {
      console.error("Error auto-generating insights:", aiError);
    } finally {
      setGeneratingSummary(false);
    }
  } else if (
    assessment.writingScores && 
    assessment.writingScores.length > 0 && 
    assessment.writingScores.some(score => score.score === 0) &&
    !analysisStatus
  ) {
    console.log("Found error scores, notifying user");
    
    toast({
      title: "Writing Evaluation Issues",
      description: `Some writing prompts could not be evaluated. Try using the 'Evaluate Writing' button to retry.`,
      variant: "default",
    });
    
    // Update status to failed
    try {
      await updateAssessmentAnalysis(assessment.id, {
        analysisStatus: 'failed' as AnalysisStatus,
        analysisError: 'Some writing prompts could not be evaluated'
      });
      
      // Create new object reference to ensure React detects the change
      setAssessment({
        ...assessment,
        analysisStatus: 'failed' as AnalysisStatus,
        analysisError: 'Some writing prompts could not be evaluated'
      });
    } catch (updateError) {
      console.error("Failed to update analysis status:", updateError);
    }
  }
};
