
import { 
  generateDetailedWritingAnalysis,
  generatePersonalityInsights,
  generateInterviewQuestions,
  compareWithIdealProfile, 
  generateAptitudeAnalysis
} from "@/services/geminiService";

/**
 * Maps analysis type strings to appropriate generator functions and update keys
 */
export const mapAnalysisType = (type: string) => {
  switch(type.toLowerCase()) {
    case 'writing':
      return {
        analysisType: 'writing',
        updateKey: 'detailedWritingAnalysis',
        generatorFunction: generateDetailedWritingAnalysis
      };
    case 'personality':
      return {
        analysisType: 'personality',
        updateKey: 'personalityInsights',
        generatorFunction: generatePersonalityInsights
      };
    case 'interview':
    case 'questions':
      return {
        analysisType: 'interview',
        updateKey: 'interviewQuestions',
        generatorFunction: generateInterviewQuestions
      };
    case 'profile':
      return {
        analysisType: 'profile',
        updateKey: 'profileMatch',
        generatorFunction: compareWithIdealProfile
      };
    case 'aptitude':
      return {
        analysisType: 'aptitude',
        updateKey: 'aptitudeAnalysis',
        generatorFunction: generateAptitudeAnalysis
      };
    default:
      throw new Error(`Unknown analysis type: ${type}`);
  }
};
