
import { WritingPromptItem } from "@/components/AssessmentManager";
import { DetailedAnalysis } from "../types";
import { makeGeminiRequest, parseJsonResponse } from "../config";

export const generateDetailedWritingAnalysis = async (assessmentData: any): Promise<DetailedAnalysis> => {
  try {
    console.log("Generating detailed writing analysis for:", assessmentData.candidateName);
    
    const writingResponses = assessmentData.completedPrompts
      .map((prompt: WritingPromptItem) => `Prompt: ${prompt.prompt}\nResponse: ${prompt.response}`)
      .join("\n\n---\n\n");
    
    const promptTemplate = `
You are an objective writing analyst for job candidate assessments. Your task is to analyze writing samples in a consistent, fair manner without making assumptions about the candidate.

# WRITING SAMPLES
${writingResponses}

# ANALYSIS INSTRUCTIONS
Analyze only the text provided above. Focus on writing style, vocabulary level, and critical thinking demonstrated in the responses.

Analyze ONLY these specific aspects:
1. Writing style - formal, technical, conversational, etc.
2. Vocabulary level - basic, intermediate, advanced
3. Critical thinking ability - as demonstrated through logical reasoning, analysis, and problem-solving in writing
4. Three specific strength areas 
5. Three specific areas for improvement

Be factual and objective. Base ALL analysis on the text samples provided.
DO NOT make assumptions about the candidate's background, personality, or characteristics that cannot be directly observed in the writing.

# FORMAT
Return your analysis as a JSON object with this exact structure:
{
  "writingStyle": "Description of writing style, 1-2 sentences only",
  "vocabularyLevel": "Assessment of vocabulary level, 1-2 sentences only",
  "criticalThinking": "Evaluation of critical thinking ability, 1-2 sentences only",
  "strengthAreas": ["strength 1 - one brief sentence", "strength 2 - one brief sentence", "strength 3 - one brief sentence"],
  "improvementAreas": ["improvement 1 - one brief sentence", "improvement 2 - one brief sentence", "improvement 3 - one brief sentence"]
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.2);
    const analysis = parseJsonResponse(text);
    
    return { 
      writingStyle: analysis.writingStyle || "Unable to analyze writing style",
      vocabularyLevel: analysis.vocabularyLevel || "Unable to analyze vocabulary level",
      criticalThinking: analysis.criticalThinking || "Unable to analyze critical thinking",
      strengthAreas: analysis.strengthAreas || ["No specific strengths identified"],
      improvementAreas: analysis.improvementAreas || ["No specific areas for improvement identified"]
    };
  } catch (error) {
    console.error("Error generating detailed writing analysis:", error);
    return {
      writingStyle: "Analysis failed",
      vocabularyLevel: "Analysis failed",
      criticalThinking: "Analysis failed",
      strengthAreas: ["Unable to analyze strengths at this time"],
      improvementAreas: ["Unable to analyze areas for improvement at this time"]
    };
  }
};
