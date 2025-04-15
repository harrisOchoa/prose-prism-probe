
import { CandidateProfileMatch } from "../types";
import { makeGeminiRequest, parseJsonResponse } from "../config";

export const compareWithIdealProfile = async (assessmentData: any): Promise<CandidateProfileMatch> => {
  try {
    console.log("Comparing candidate with ideal profile:", assessmentData.candidateName);
    
    const position = assessmentData.candidatePosition || "Not specified";
    const aptitudeScore = assessmentData.aptitudeScore || 0;
    const aptitudeTotal = assessmentData.aptitudeTotal || 0;
    const aptitudePercentage = aptitudeTotal > 0 ? Math.round((aptitudeScore / aptitudeTotal) * 100) : 0;
    const writingScore = assessmentData.overallWritingScore || 0;
    const writingPercentage = Math.round((writingScore / 5) * 100);
    const overallScore = Math.round((aptitudePercentage + writingPercentage) / 2);
    
    const strengths = assessmentData.strengths || [];
    const weaknesses = assessmentData.weaknesses || [];
    
    const promptTemplate = `
You are an objective profile analyst for job candidate assessments. Your task is to compare assessment results against standard role requirements.

# CANDIDATE ASSESSMENT DATA
Position: ${position}
Aptitude Score: ${aptitudeScore}/${aptitudeTotal} (${aptitudePercentage}%)
Writing Score: ${writingScore}/5 (${writingPercentage}%)
Overall Score: ${overallScore}%

${strengths.length > 0 ? "Identified Strengths:\n- " + strengths.join("\n- ") : "No specific strengths identified."}
${weaknesses.length > 0 ? "Identified Improvement Areas:\n- " + weaknesses.join("\n- ") : "No specific improvement areas identified."}

# ANALYSIS INSTRUCTIONS
Compare the candidate's assessment results against typical requirements for their target position.
Identify specific matches and gaps based solely on the assessment data provided.
Do not make assumptions about skills or qualifications not evidenced in the assessment results.

# FORMAT
Return your analysis as a JSON object with this exact structure:
{
  "position": "The position being analyzed",
  "matchPercentage": overall match percentage as a number between 0-100,
  "keyMatches": ["match 1", "match 2", "match 3"],
  "keyGaps": ["gap 1", "gap 2", "gap 3"]
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
