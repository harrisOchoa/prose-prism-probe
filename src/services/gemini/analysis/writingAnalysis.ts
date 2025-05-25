
import { WritingPromptItem } from "@/components/AssessmentManager";
import { DetailedWritingAnalysis } from "../types";
import { makeGeminiRequest, parseJsonResponse } from "../config";

export const generateDetailedWritingAnalysis = async (assessmentData: any): Promise<DetailedWritingAnalysis> => {
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
  "communicationStyle": {
    "observation": "Specific writing characteristic observed",
    "evidence": "Direct quote or specific reference from responses",
    "confidence": confidence score 0-100
  },
  "technicalWriting": {
    "observation": "Technical communication ability if demonstrated",
    "evidence": "Specific examples from responses",
    "confidence": confidence score 0-100
  },
  "clarity": {
    "observation": "How clearly candidate expresses ideas",
    "evidence": "Examples of clear or unclear communication",
    "confidence": confidence score 0-100
  },
  "roleAlignment": {
    "observation": "How writing demonstrates ${position}-relevant skills",
    "evidence": "Specific examples from responses",
    "confidence": confidence score 0-100
  },
  "overallAssessment": "Summary based only on demonstrated writing abilities with specific evidence citations"
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.2);
    const analysisData = parseJsonResponse(text);
    
    // Validate that analysis includes evidence
    const requiredFields = ['communicationStyle', 'technicalWriting', 'clarity', 'roleAlignment', 'overallAssessment'];
    for (const field of requiredFields) {
      if (!analysisData[field]) {
        console.warn(`Missing required field: ${field}`);
      }
    }
    
    return {
      communicationStyle: analysisData.communicationStyle || { observation: "Insufficient data", evidence: "No evidence available", confidence: 0 },
      technicalWriting: analysisData.technicalWriting || { observation: "Not assessed", evidence: "No technical content found", confidence: 0 },
      clarity: analysisData.clarity || { observation: "Cannot assess", evidence: "Insufficient writing samples", confidence: 0 },
      roleAlignment: analysisData.roleAlignment || { observation: "Cannot determine", evidence: "No role-specific content", confidence: 0 },
      overallAssessment: analysisData.overallAssessment || "Insufficient data for comprehensive writing analysis"
    };
  } catch (error) {
    console.error("Error generating detailed writing analysis:", error);
    return {
      communicationStyle: { observation: "Analysis failed", evidence: "Error occurred during analysis", confidence: 0 },
      technicalWriting: { observation: "Analysis failed", evidence: "Error occurred during analysis", confidence: 0 },
      clarity: { observation: "Analysis failed", evidence: "Error occurred during analysis", confidence: 0 },
      roleAlignment: { observation: "Analysis failed", evidence: "Error occurred during analysis", confidence: 0 },
      overallAssessment: "Unable to complete writing analysis due to technical error"
    };
  }
};
