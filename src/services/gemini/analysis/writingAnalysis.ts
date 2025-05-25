import { WritingPromptItem } from "@/components/AssessmentManager";
import { DetailedAnalysis } from "../types";
import { makeGeminiRequest, parseJsonResponse } from "../config";

export const generateDetailedWritingAnalysis = async (assessmentData: any): Promise<DetailedAnalysis> => {
  try {
    console.log("Generating detailed writing analysis for:", assessmentData.candidateName);
    
    const writingResponses = assessmentData.completedPrompts || [];
    const writingScores = assessmentData.writingScores || [];
    const position = assessmentData.candidatePosition || "Not specified";
    
    if (!writingResponses || writingResponses.length === 0) {
      throw new Error("No writing responses available for analysis");
    }
    
    const responsesWithScores = writingResponses.map((prompt: WritingPromptItem, index: number) => {
      const score = writingScores[index];
      return `
PROMPT ${index + 1}: ${prompt.prompt}
RESPONSE: ${prompt.response}
${score ? `SCORE: ${score.score}/5
FEEDBACK: ${score.feedback}` : 'Not yet scored'}
---`;
    }).join('\n');
    
    const promptTemplate = `
You are a professional writing analyst for job candidate assessments. Your task is to analyze writing samples based ONLY on the provided text evidence.

# WRITING ASSESSMENT DATA
Position Applied For: ${position}
Number of Writing Samples: ${writingResponses.length}

${responsesWithScores}

# ANALYSIS REQUIREMENTS
CRITICAL: Base ALL analysis ONLY on evidence visible in the writing samples above. You must:

1. **Evidence-Based Analysis**: Every observation must reference specific text from the responses
2. **Quote Requirement**: Include actual quotes or paraphrases from responses to support each point
3. **No Assumptions**: Do not infer abilities, personality traits, or characteristics not demonstrated in the text
4. **Measurable Only**: Focus only on observable writing characteristics (vocabulary, structure, clarity, etc.)
5. **Position Relevance**: Connect observations to ${position} role requirements only when directly supported by writing evidence

For each analysis point:
- State the observation
- Provide specific textual evidence (quote or detailed reference)
- Explain how this evidence supports your conclusion
- Rate confidence (0-100) based on consistency across all samples

Do NOT analyze:
- Personality traits not directly shown in communication style
- Technical skills unless explicitly demonstrated in responses
- Motivations or attitudes unless clearly expressed in text
- Background or experience unless mentioned by candidate

# FORMAT
Return as JSON with this structure:
{
  "writingStyle": "Specific writing characteristics observed with evidence citations",
  "vocabularyLevel": "Vocabulary assessment based on actual word usage with examples",
  "criticalThinking": "Critical thinking demonstration with specific response references",
  "strengthAreas": ["Specific strength with evidence", "Another strength with quotes"],
  "improvementAreas": ["Specific improvement area with evidence", "Another area with examples"]
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.2);
    const analysisData = parseJsonResponse(text);
    
    // Validate that analysis includes evidence
    const requiredFields = ['writingStyle', 'vocabularyLevel', 'criticalThinking', 'strengthAreas', 'improvementAreas'];
    for (const field of requiredFields) {
      if (!analysisData[field]) {
        console.warn(`Missing required field: ${field}`);
      }
    }
    
    return {
      writingStyle: analysisData.writingStyle || "Insufficient data for writing style analysis",
      vocabularyLevel: analysisData.vocabularyLevel || "Cannot assess vocabulary level from available samples",
      criticalThinking: analysisData.criticalThinking || "Insufficient evidence for critical thinking assessment",
      strengthAreas: analysisData.strengthAreas || ["Insufficient writing samples for strength identification"],
      improvementAreas: analysisData.improvementAreas || ["Cannot determine improvement areas without more writing data"]
    };
  } catch (error) {
    console.error("Error generating detailed writing analysis:", error);
    return {
      writingStyle: "Analysis failed due to technical error",
      vocabularyLevel: "Analysis failed due to technical error", 
      criticalThinking: "Analysis failed due to technical error",
      strengthAreas: ["Unable to analyze strengths due to technical error"],
      improvementAreas: ["Unable to analyze improvement areas due to technical error"]
    };
  }
};
