
import { aiServiceManager } from "./ai/AIServiceManager";

/**
 * Enhanced writing evaluation with AI fallback
 */
export const evaluateAllWritingPromptsEnhanced = async (prompts: any[]): Promise<any[]> => {
  console.log("Starting enhanced writing evaluation with fallback...");
  const response = await aiServiceManager.evaluateWriting(prompts);
  console.log(`Writing evaluation completed using ${response.provider}`);
  return response.data;
};

/**
 * Enhanced candidate summary with AI fallback
 */
export const generateCandidateSummaryEnhanced = async (assessmentData: any): Promise<string> => {
  console.log("Starting enhanced summary generation with fallback...");
  const response = await aiServiceManager.generateSummary(assessmentData);
  console.log(`Summary generation completed using ${response.provider}`);
  return response.data;
};

/**
 * Enhanced strengths/weaknesses with AI fallback
 */
export const generateStrengthsAndWeaknessesEnhanced = async (assessmentData: any): Promise<{ strengths: string[], weaknesses: string[] }> => {
  console.log("Starting enhanced strengths/weaknesses generation with fallback...");
  const response = await aiServiceManager.generateStrengthsWeaknesses(assessmentData);
  console.log(`Strengths/weaknesses generation completed using ${response.provider}`);
  return response.data;
};

/**
 * Enhanced detailed writing analysis with AI fallback
 */
export const generateDetailedWritingAnalysisEnhanced = async (assessmentData: any): Promise<any> => {
  console.log("Starting enhanced detailed writing analysis with fallback...");
  const response = await aiServiceManager.generateDetailedWritingAnalysis(assessmentData);
  console.log(`Detailed writing analysis completed using ${response.provider}`);
  return response.data;
};

/**
 * Enhanced personality insights with AI fallback
 */
export const generatePersonalityInsightsEnhanced = async (assessmentData: any): Promise<any> => {
  console.log("Starting enhanced personality insights generation with fallback...");
  const response = await aiServiceManager.generatePersonalityInsights(assessmentData);
  console.log(`Personality insights generation completed using ${response.provider}`);
  return response.data;
};

/**
 * Enhanced interview questions with AI fallback
 */
export const generateInterviewQuestionsEnhanced = async (assessmentData: any): Promise<any> => {
  console.log("Starting enhanced interview questions generation with fallback...");
  const response = await aiServiceManager.generateInterviewQuestions(assessmentData);
  console.log(`Interview questions generation completed using ${response.provider}`);
  return response.data;
};

/**
 * Enhanced profile match with AI fallback
 */
export const compareWithIdealProfileEnhanced = async (assessmentData: any): Promise<any> => {
  console.log("Starting enhanced profile match analysis with fallback...");
  const response = await aiServiceManager.generateProfileMatch(assessmentData);
  console.log(`Profile match analysis completed using ${response.provider}`);
  return response.data;
};

/**
 * Enhanced aptitude analysis with AI fallback
 */
export const generateAptitudeAnalysisEnhanced = async (assessmentData: any): Promise<any> => {
  console.log("Starting enhanced aptitude analysis with fallback...");
  const response = await aiServiceManager.generateAptitudeAnalysis(assessmentData);
  console.log(`Aptitude analysis completed using ${response.provider}`);
  return response.data;
};

/**
 * Get AI service health status
 */
export const getAIServiceHealth = () => {
  return aiServiceManager.getHealthStatus();
};
