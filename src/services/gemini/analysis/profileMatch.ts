
import { CandidateProfileMatch } from "../types";
import { makeGeminiRequest, parseJsonResponse } from "../config";
import { WritingPromptItem } from "@/components/AssessmentManager";

export const compareWithIdealProfile = async (assessmentData: any): Promise<CandidateProfileMatch> => {
  try {
    console.log("Comparing candidate profile match for:", assessmentData.candidateName);
    
    const position = assessmentData.candidatePosition || "Not specified";
    const aptitudeScore = assessmentData.aptitudeScore || 0;
    const aptitudeTotal = assessmentData.aptitudeTotal || 0;
    const aptitudePercentage = aptitudeTotal > 0 ? Math.round((aptitudeScore / aptitudeTotal) * 100) : 0;
    
    const writingScores = assessmentData.writingScores || [];
    const overallWritingScore = assessmentData.overallWritingScore || 0;
    const writingPercentage = Math.round((overallWritingScore / 5) * 100);

    // Get completed writing prompts for evidence
    const writingPrompts = assessmentData.completedPrompts || [];
    const writingEvidence = writingPrompts.map((prompt: WritingPromptItem, index: number) => {
      const score = writingScores[index];
      return `
PROMPT ${index + 1}: ${prompt.prompt}
RESPONSE: ${prompt.response}
${score ? `EVALUATION: ${score.score}/5 - ${score.feedback}` : 'Not evaluated'}
---`;
    }).join('\n');

    const promptTemplate = `
You are an objective role-fit analyst for job candidate assessments. Analyze how the candidate's DEMONSTRATED performance aligns with the ${position} role requirements.

# CANDIDATE ASSESSMENT DATA
Position: ${position}
Aptitude Performance: ${aptitudeScore}/${aptitudeTotal} (${aptitudePercentage}%)
Writing Performance: ${overallWritingScore}/5 (${writingPercentage}%)

# WRITING ASSESSMENT EVIDENCE
${writingEvidence || "No writing assessment data available"}

# ANALYSIS REQUIREMENTS
CRITICAL: Base ALL match/gap analysis on DEMONSTRATED evidence only:

1. **Evidence-Required**: Every match or gap must cite specific assessment evidence
2. **No Role Assumptions**: Do not assume role requirements not clearly relevant to measured skills
3. **Data-Driven**: Use only aptitude scores and writing performance as indicators
4. **Specific Examples**: Reference actual responses or performance metrics
5. **Confidence Scoring**: Rate match percentage based on strength of available evidence

For each match or gap:
- State the specific skill or requirement
- Provide exact evidence from assessment data
- Explain how the evidence supports or contradicts the requirement
- Do NOT infer skills not demonstrated in the assessment

Calculate match percentage based on:
- Aptitude performance relative to role cognitive demands
- Writing clarity and communication effectiveness
- Problem-solving demonstration in responses
- Only skills actually measured in the assessment

# FORMAT
Return as JSON:
{
  "position": "${position}",
  "matchPercentage": [0-100 based on demonstrated performance evidence],
  "keyMatches": [
    "Specific skill/requirement with direct assessment evidence (quote aptitude score, writing example, etc.)",
    "Another match with specific evidence from assessment data",
    "Third match with measurable performance indicator"
  ],
  "keyGaps": [
    "Specific skill gap with assessment evidence (low score area, writing weakness, etc.)",
    "Another gap supported by assessment data",
    "Third gap with specific performance evidence"
  ]
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.3);
    const profileData = parseJsonResponse(text);
    
    // Validate that matches and gaps include evidence
    const validateEvidenceBased = (items: string[]) => {
      return items.filter(item => 
        item && 
        (item.includes('%') || item.includes('/') || item.includes('score') || item.includes('response') || item.includes('writing'))
      );
    };
    
    const validMatches = validateEvidenceBased(profileData.keyMatches || []);
    const validGaps = validateEvidenceBased(profileData.keyGaps || []);
    
    // If no evidence-based insights, provide data-limited analysis
    if (validMatches.length === 0 && validGaps.length === 0) {
      return {
        position: position,
        matchPercentage: 0,
        keyMatches: [`Limited assessment data available for ${position} role evaluation`],
        keyGaps: ["Insufficient assessment data to identify specific skill gaps"]
      };
    }
    
    return {
      position: profileData.position || position,
      matchPercentage: Math.min(100, Math.max(0, profileData.matchPercentage || 0)),
      keyMatches: validMatches.length > 0 ? validMatches : ["No evidence-based matches identified"],
      keyGaps: validGaps.length > 0 ? validGaps : ["No evidence-based gaps identified"]
    };
  } catch (error) {
    console.error("Error generating profile match analysis:", error);
    return {
      position: "Analysis failed",
      matchPercentage: 0,
      keyMatches: ["Unable to analyze role match due to technical error"],
      keyGaps: ["Unable to analyze role gaps due to technical error"]
    };
  }
};
