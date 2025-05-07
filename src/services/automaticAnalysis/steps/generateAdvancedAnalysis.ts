
import { AssessmentData } from "@/types/assessment";
import { 
  generateDetailedWritingAnalysis, 
  generatePersonalityInsights, 
  generateInterviewQuestions,
  compareWithIdealProfile,
  generateAptitudeAnalysis
} from "@/services/gemini";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import { AnalysisStatus } from "@/firebase/services/assessment/types";
import { AnalysisProgress } from "../types";

/**
 * Step 3: Generate advanced analysis (asynchronous, non-blocking)
 */
export const generateAdvancedAnalysis = async (
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
      { fn: compareWithIdealProfile, key: 'profileMatch', name: 'profile_match' }
    ];
    
    // Handle aptitude analysis separately if aptitude score exists
    if (data.aptitudeScore !== undefined) {
      try {
        console.log('Generating aptitude_analysis...');
        const aptitudeResult = await generateAptitudeAnalysis(data);
        
        if (aptitudeResult) {
          // Update aptitude analysis result immediately
          await updateAssessmentAnalysis(assessmentId, {
            aptitudeAnalysis: aptitudeResult
          });
          
          progress.completedSteps.push('aptitude_analysis');
          console.log('aptitude_analysis completed successfully');
        }
      } catch (aptitudeError) {
        console.error('Error generating aptitude_analysis:', aptitudeError);
        progress.failedSteps.push('aptitude_analysis');
      }
      
      // Wait between analyses to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
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
