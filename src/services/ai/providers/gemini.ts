
import { AIProvider } from "../types";
import { 
  evaluateAllWritingPrompts,
  generateCandidateSummary,
  generateStrengthsAndWeaknesses,
  generateDetailedWritingAnalysis,
  generatePersonalityInsights,
  generateInterviewQuestions,
  compareWithIdealProfile,
  generateAptitudeAnalysis
} from "../../gemini";

export class GeminiProvider implements AIProvider {
  name = "Gemini";

  async isAvailable(): Promise<boolean> {
    try {
      // Try a simple test request to check if Gemini is working
      await generateCandidateSummary({
        candidateName: "test",
        candidatePosition: "test",
        completedPrompts: []
      });
      return true;
    } catch (error: any) {
      // Check if it's a rate limit error - service is available but limited
      if (error.message?.toLowerCase().includes('rate limit')) {
        return false; // Consider rate limited as unavailable for fallback
      }
      return false;
    }
  }

  async generateWritingEvaluation(prompts: any[]): Promise<any[]> {
    return await evaluateAllWritingPrompts(prompts);
  }

  async generateCandidateSummary(assessmentData: any): Promise<string> {
    return await generateCandidateSummary(assessmentData);
  }

  async generateStrengthsAndWeaknesses(assessmentData: any): Promise<{ strengths: string[], weaknesses: string[] }> {
    return await generateStrengthsAndWeaknesses(assessmentData);
  }

  async generateDetailedWritingAnalysis(assessmentData: any): Promise<any> {
    return await generateDetailedWritingAnalysis(assessmentData);
  }

  async generatePersonalityInsights(assessmentData: any): Promise<any> {
    return await generatePersonalityInsights(assessmentData);
  }

  async generateInterviewQuestions(assessmentData: any): Promise<any> {
    return await generateInterviewQuestions(assessmentData);
  }

  async generateProfileMatch(assessmentData: any): Promise<any> {
    return await compareWithIdealProfile(assessmentData);
  }

  async generateAptitudeAnalysis(assessmentData: any): Promise<any> {
    return await generateAptitudeAnalysis(assessmentData);
  }
}
