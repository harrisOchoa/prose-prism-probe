
import { WritingPromptItem } from "@/components/AssessmentManager";
import { PersonalityInsight } from "../types";
import { makeGeminiRequest, parseJsonResponse } from "../config";

export const generatePersonalityInsights = async (assessmentData: any): Promise<PersonalityInsight[]> => {
  try {
    console.log("Generating personality insights for:", assessmentData.candidateName);
    
    const writingResponses = assessmentData.completedPrompts
      .map((prompt: WritingPromptItem) => `Prompt: ${prompt.prompt}\nResponse: ${prompt.response}`)
      .join("\n\n---\n\n");
    
    const promptTemplate = `
You are an objective writing style analyst for job candidate assessments. Your task is to analyze writing samples to identify communication styles and tendencies shown in the text.

# WRITING SAMPLES
${writingResponses}

# ANALYSIS INSTRUCTIONS
Analyze ONLY the language patterns and communication tendencies evident in the provided text samples. 
Focus on identifying 5 key communication traits that are objectively demonstrated in the writing.

For each trait:
1. Identify a specific communication tendency or style element displayed in the writing
2. Provide a brief description of how this trait is demonstrated in the text
3. Assess your confidence level (0-100) based on how consistently this trait appears across all samples

Important guidelines:
- Analyze ONLY writing and communication styles, NOT personality traits
- Use neutral, professional language
- Base ALL insights on text evidence, not assumptions
- DO NOT attempt to diagnose personality types or make character judgments
- Provide confidence levels that reflect the evidence strength
- Focus on communication tendencies relevant to professional contexts

# FORMAT
Return your analysis as a JSON object with this exact structure:
{
  "insights": [
    {
      "trait": "Specific communication style element",
      "description": "Brief description of how this is demonstrated in the text",
      "confidence": confidence score as number between 0-100
    },
    ... (4 more traits with the same structure)
  ]
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.2);
    const insightsData = parseJsonResponse(text);
    
    if (!insightsData.insights || !Array.isArray(insightsData.insights)) {
      throw new Error("Invalid insights format");
    }
    
    return insightsData.insights.map((i: any) => ({
      trait: i.trait || "Unknown trait",
      description: i.description || "No description provided",
      confidence: i.confidence || 0
    }));
  } catch (error) {
    console.error("Error generating personality insights:", error);
    return [
      {
        trait: "Unable to analyze personality",
        description: "An error occurred during analysis",
        confidence: 0
      }
    ];
  }
};
