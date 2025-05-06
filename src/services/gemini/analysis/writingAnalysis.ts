
import { WritingPromptItem } from "@/components/AssessmentManager";
import { DetailedAnalysis } from "../types";
import { makeGeminiRequest, parseJsonResponse } from "../config";

export const generateDetailedWritingAnalysis = async (assessmentData: any): Promise<DetailedAnalysis> => {
  try {
    console.log("Generating detailed writing analysis for:", assessmentData.candidateName);
    
    if (!assessmentData.completedPrompts || assessmentData.completedPrompts.length === 0) {
      throw new Error("No writing samples found for analysis");
    }
    
    const writingResponses = assessmentData.completedPrompts
      .map((prompt: WritingPromptItem) => `Prompt: ${prompt.prompt}\nResponse: ${prompt.response}`)
      .join("\n\n---\n\n");
    
    // If the writing responses are too short, throw error
    if (writingResponses.length < 50) {
      throw new Error("Writing samples are too short for meaningful analysis");
    }
    
    console.log(`Preparing analysis request with ${writingResponses.length} characters of writing samples`);
    
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

    console.log("Sending request to Gemini API...");
    const text = await makeGeminiRequest(promptTemplate, 0.2);
    
    if (!text || text.trim() === '') {
      throw new Error("Empty response received from Gemini API");
    }
    
    console.log("Received response, parsing JSON...");
    const analysis = parseJsonResponse(text);
    
    if (!analysis) {
      throw new Error("Failed to parse response from Gemini API");
    }
    
    // Validate that we have all the required fields
    if (!analysis.writingStyle || !analysis.vocabularyLevel || !analysis.criticalThinking) {
      console.error("Missing critical fields in analysis:", analysis);
      throw new Error("Incomplete analysis result received");
    }
    
    return { 
      writingStyle: analysis.writingStyle || "Unable to analyze writing style",
      vocabularyLevel: analysis.vocabularyLevel || "Unable to analyze vocabulary level",
      criticalThinking: analysis.criticalThinking || "Unable to analyze critical thinking",
      strengthAreas: analysis.strengthAreas || ["No specific strengths identified"],
      improvementAreas: analysis.improvementAreas || ["No specific areas for improvement identified"]
    };
  } catch (error: any) {
    console.error("Error generating detailed writing analysis:", error);
    throw new Error(`Writing analysis failed: ${error.message}`);
  }
};
