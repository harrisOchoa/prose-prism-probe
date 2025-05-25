
import { AssessmentData } from "@/types/assessment";
import { 
  generateDetailedWritingAnalysisEnhanced, 
  generatePersonalityInsightsEnhanced, 
  generateInterviewQuestionsEnhanced,
  compareWithIdealProfileEnhanced,
  generateAptitudeAnalysisEnhanced
} from "@/services/geminiEnhanced";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import { AnalysisStatus } from "@/firebase/services/assessment/types";
import { AnalysisProgress } from "../types";

/**
 * Enhanced Step 3: Generate advanced analysis with AI fallback
 */
export const generateAdvancedAnalysisEnhanced = async (
  assessmentId: string,
  data: AssessmentData,
  progress: AnalysisProgress
): Promise<void> => {
  try {
    console.log(`Starting enhanced advanced analysis for assessment ${assessmentId}`);
    
    // Update status to indicate enhanced advanced analysis has started
    await updateAssessmentAnalysis(assessmentId, {
      analysisStatus: 'advanced_analysis_started' as AnalysisStatus
    });
    
    progress.status = 'advanced_analysis_started';
    
    // Define enhanced analysis generators
    const analysisGenerators = [
      { fn: generateDetailedWritingAnalysisEnhanced, key: 'detailedWritingAnalysis', name: 'writing_analysis_enhanced' },
      { fn: generatePersonalityInsightsEnhanced, key: 'personalityInsights', name: 'personality_insights_enhanced' },
      { fn: generateInterviewQuestionsEnhanced, key: 'interviewQuestions', name: 'interview_questions_enhanced' },
      { fn: compareWithIdealProfileEnhanced, key: 'profileMatch', name: 'profile_match_enhanced' }
    ];
    
    // Handle enhanced aptitude analysis if aptitude score exists
    if (data.aptitudeScore !== undefined) {
      try {
        console.log('Generating enhanced aptitude_analysis...');
        const aptitudeResult = await generateAptitudeAnalysisEnhanced(data);
        
        if (aptitudeResult) {
          await updateAssessmentAnalysis(assessmentId, {
            aptitudeAnalysis: aptitudeResult
          });
          
          progress.completedSteps.push('aptitude_analysis_enhanced');
          console.log('Enhanced aptitude_analysis completed successfully');
        }
      } catch (aptitudeError) {
        console.error('Error generating enhanced aptitude_analysis:', aptitudeError);
        progress.failedSteps.push('aptitude_analysis_enhanced');
      }
      
      // Shorter wait since we have fallback
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Process each enhanced analysis type
    for (const { fn, key, name } of analysisGenerators) {
      try {
        console.log(`Generating enhanced ${name}...`);
        const result = await fn(data);
        
        if (result) {
          await updateAssessmentAnalysis(assessmentId, {
            [key]: result
          });
          
          progress.completedSteps.push(name);
          console.log(`Enhanced ${name} completed successfully`);
        }
      } catch (analysisError) {
        console.error(`Error generating enhanced ${name}:`, analysisError);
        progress.failedSteps.push(name);
        // Continue with other analyses
      }
      
      // Shorter wait since we have fallback
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Update final status
    await updateAssessmentAnalysis(assessmentId, {
      analysisStatus: 'completed' as AnalysisStatus
    });
    
    progress.status = 'completed';
    console.log(`Enhanced advanced analysis completed for assessment ${assessmentId}`);
    
  } catch (error) {
    console.error(`Enhanced advanced analysis process failed:`, error);
    progress.failedSteps.push('advanced_analysis_enhanced');
  }
};
