
import { WritingPromptItem } from "@/components/AssessmentManager";
import { PersonalityInsight } from "../types";
import { makeGeminiRequest, parseJsonResponse } from "../config";

export const generatePersonalityInsights = async (assessmentData: any): Promise<PersonalityInsight[]> => {
  try {
    console.log("Generating communication pattern insights for:", assessmentData.candidateName);
    
    const writingResponses = assessmentData.completedPrompts || [];
    
    if (!writingResponses || writingResponses.length === 0) {
      throw new Error("No writing responses available for communication analysis");
    }
    
    const responsesText = writingResponses
      .map((prompt: WritingPromptItem, index: number) => `
PROMPT ${index + 1}: ${prompt.prompt}
RESPONSE: ${prompt.response}
---`)
      .join("\n");
    
    const promptTemplate = `
You are a communication pattern analyst for professional assessments. Analyze ONLY the communication style and patterns visible in the provided writing samples.

# WRITING SAMPLES
${responsesText}

# ANALYSIS REQUIREMENTS
CRITICAL CONSTRAINTS:
- Analyze ONLY communication patterns observable in the text
- Base every insight on specific textual evidence
- Do NOT infer personality traits, character, or psychological attributes
- Focus on professional communication competencies only
- Cite specific examples from responses for each insight

Analyze for these communication patterns:
1. **Response Structure**: How the candidate organizes thoughts and ideas
2. **Communication Clarity**: How clearly ideas are expressed
3. **Professional Tone**: Level of formality and professionalism in communication
4. **Problem-Solving Communication**: How they explain processes or solutions
5. **Detail Orientation**: Level of specificity and thoroughness in responses

For each pattern identified:
- Describe the specific communication behavior observed
- Provide direct quotes or specific references from responses
- Rate confidence (0-100) based on consistency across samples
- Ensure observation is relevant to workplace communication

IMPORTANT: If insufficient evidence exists for a pattern, state "Insufficient evidence" rather than making assumptions.

# FORMAT
Return as JSON:
{
  "insights": [
    {
      "trait": "Specific communication pattern observed",
      "description": "Detailed description with direct quotes or references from responses",
      "confidence": confidence score 0-100 based on evidence strength
    },
    ... (up to 5 insights maximum, only if sufficient evidence exists)
  ]
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.2);
    const insightsData = parseJsonResponse(text);
    
    if (!insightsData.insights || !Array.isArray(insightsData.insights)) {
      throw new Error("Invalid insights format received from analysis");
    }
    
    // Filter out low-confidence insights and ensure evidence is provided
    const validInsights = insightsData.insights
      .filter((insight: any) => insight.confidence >= 30 && insight.description && !insight.description.includes("Insufficient evidence"))
      .map((insight: any) => ({
        trait: insight.trait || "Communication pattern",
        description: insight.description || "No description available",
        confidence: Math.min(100, Math.max(0, insight.confidence || 0))
      }));
    
    if (validInsights.length === 0) {
      return [{
        trait: "Limited communication data",
        description: "Insufficient writing samples to identify consistent communication patterns",
        confidence: 100
      }];
    }
    
    return validInsights;
  } catch (error) {
    console.error("Error generating communication pattern insights:", error);
    return [
      {
        trait: "Analysis unavailable",
        description: "Unable to analyze communication patterns due to technical error",
        confidence: 0
      }
    ];
  }
};
