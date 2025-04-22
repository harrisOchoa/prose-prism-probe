
import { CandidateProfileMatch } from "../types";
import { makeGeminiRequest, parseJsonResponse } from "../config";
import { WritingPromptItem, WritingScore } from "@/types";

export const compareWithIdealProfile = async (assessmentData: any): Promise<CandidateProfileMatch> => {
  try {
    console.log("Comparing candidate with ideal profile:", assessmentData.candidateName);
    
    const position = assessmentData.candidatePosition || "Not specified";
    const aptitudeScore = assessmentData.aptitudeScore || 0;
    const aptitudeTotal = assessmentData.aptitudeTotal || 0;
    const aptitudePercentage = aptitudeTotal > 0 ? Math.round((aptitudeScore / aptitudeTotal) * 100) : 0;
    
    const writingScores = assessmentData.writingScores || [];
    const overallWritingScore = assessmentData.overallWritingScore || 0;
    const writingPercentage = Math.round((overallWritingScore / 5) * 100);

    // Calculate overall score with equal weight to aptitude and writing
    const overallScore = Math.round((aptitudePercentage + writingPercentage) / 2);
    
    // Get completed writing prompts for analysis
    const writingPrompts = assessmentData.completedPrompts || [];
    
    const promptTemplate = `
You are an objective profile analyst for job candidate assessments. Analyze both cognitive aptitude and writing ability to determine role fit.

# CANDIDATE ASSESSMENT DATA
Position: ${position}
Aptitude Performance: ${aptitudeScore}/${aptitudeTotal} (${aptitudePercentage}%)
Writing Score: ${overallWritingScore}/5 (${writingPercentage}%)
Overall Match: ${overallScore}%

Writing Samples Analysis:
${writingPrompts.map((prompt: WritingPromptItem, index: number) => `
Question ${index + 1}: ${prompt.prompt}
Response: ${prompt.response}
${writingScores[index] ? `Score: ${writingScores[index].score}/5
Feedback: ${writingScores[index].feedback}` : 'Not evaluated'}
`).join('\n')}

# ANALYSIS INSTRUCTIONS
1. Evaluate both technical aptitude and writing abilities for the ${position} role.
2. Consider how the candidate's writing responses demonstrate job-relevant skills and knowledge.
3. Provide specific examples from their writing to support your analysis.
4. Calculate match percentage based on both aptitude and writing performance.

# FORMAT
Return your analysis as a JSON object with this exact structure:
{
  "position": "${position}",
  "matchPercentage": [calculated percentage between 0-100],
  "keyMatches": [
    "Match point 1 with specific evidence",
    "Match point 2 with specific evidence",
    "Match point 3 with specific evidence"
  ],
  "keyGaps": [
    "Gap 1 with specific evidence",
    "Gap 2 with specific evidence",
    "Gap 3 with specific evidence"
  ]
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.3);
    const profileData = parseJsonResponse(text);
    
    return {
      position: profileData.position || position,
      matchPercentage: profileData.matchPercentage || 0,
      keyMatches: profileData.keyMatches || ["No specific matches identified"],
      keyGaps: profileData.keyGaps || ["No specific gaps identified"]
    };
  } catch (error) {
    console.error("Error generating profile match:", error);
    return {
      position: "Analysis failed",
      matchPercentage: 0,
      keyMatches: ["Unable to analyze matches at this time"],
      keyGaps: ["Unable to analyze gaps at this time"]
    };
  }
};
