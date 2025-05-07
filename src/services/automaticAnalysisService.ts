
import { AssessmentData } from "@/types/assessment";
import { 
  evaluateAllWritingPrompts, 
  generateCandidateSummary, 
  generateStrengthsAndWeaknesses,
  generateDetailedWritingAnalysis,
  generatePersonalityInsights,
  generateInterviewQuestions,
  compareWithIdealProfile,
  generateAptitudeAnalysis
} from "./gemini";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import { AnalysisStatus } from "@/firebase/services/assessment/types";

// Progress tracking interface
export interface AnalysisProgress {
  status: AnalysisStatus;
  error?: string;
  completedSteps: string[];
  failedSteps: string[];
}

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
    generateAdvancedAnalysis(assessmentId, updatedData, progress).catch(error => {
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

/**
 * Step 1: Evaluate writing responses
 */
const evaluateWriting = async (
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

/**
 * Step 2: Generate basic insights (summary, strengths, weaknesses)
 */
const generateBasicInsights = async (
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

/**
 * Step 3: Generate advanced analysis (asynchronous, non-blocking)
 */
const generateAdvancedAnalysis = async (
  assessmentId: string,
  data: AssessmentData,
  progress: AnalysisProgress
): Promise<void> => {
  try {
    console.log(`Starting advanced analysis for assessment ${assessmentId}`);
    
    // Update status to indicate advanced analysis has started
    await updateAssessmentAnalysis(assessmentId, {
      analysisStatus: 'advanced_analysis_started' as AnalysisStatus
    });
    
    progress.status = 'advanced_analysis_started';
    
    // Define analysis generators with their update keys
    const analysisGenerators = [
      { fn: generateDetailedWritingAnalysis, key: 'detailedWritingAnalysis', name: 'writing_analysis' },
      { fn: generatePersonalityInsights, key: 'personalityInsights', name: 'personality_insights' },
      { fn: generateInterviewQuestions, key: 'interviewQuestions', name: 'interview_questions' },
      { fn: compareWithIdealProfile, key: 'profileMatch', name: 'profile_match' },
      { fn: generateAptitudeAnalysis, key: 'aptitudeAnalysis', name: 'aptitude_analysis' }
    ];
    
    // Process each analysis type sequentially to avoid rate limits
    for (const { fn, key, name } of analysisGenerators) {
      try {
        console.log(`Generating ${name}...`);
        const result = await fn(data);
        
        if (result) {
          // Update individual analysis result immediately
          await updateAssessmentAnalysis(assessmentId, {
            [key]: result
          });
          
          progress.completedSteps.push(name);
          console.log(`${name} completed successfully`);
        }
      } catch (analysisError) {
        console.error(`Error generating ${name}:`, analysisError);
        progress.failedSteps.push(name);
        // Continue with other analyses even if one fails
      }
      
      // Wait between analyses to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Update final status
    await updateAssessmentAnalysis(assessmentId, {
      analysisStatus: 'completed' as AnalysisStatus
    });
    
    progress.status = 'completed';
    console.log(`Advanced analysis completed for assessment ${assessmentId}`);
    
  } catch (error) {
    console.error(`Advanced analysis process failed:`, error);
    progress.failedSteps.push('advanced_analysis');
    // Don't update the main status to failed if just advanced analysis fails
  }
};
