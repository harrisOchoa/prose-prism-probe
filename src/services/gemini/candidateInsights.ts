
import { makeGeminiRequest, parseJsonResponse } from "./config";

export const generateCandidateSummary = async (assessmentData: any): Promise<string> => {
  try {
    console.log("Generating candidate summary for:", assessmentData.candidateName);
    
    const aptitudePercentage = assessmentData.aptitudeTotal 
      ? Math.round((assessmentData.aptitudeScore / assessmentData.aptitudeTotal) * 100) 
      : 0;
    
    const writingScorePercentage = assessmentData.overallWritingScore 
      ? Math.round((assessmentData.overallWritingScore / 5) * 100) 
      : 0;
    
    const overallScore = assessmentData.overallWritingScore
      ? Math.round((aptitudePercentage + writingScorePercentage) / 2)
      : aptitudePercentage;
    
    let writingFeedback = "No writing assessment data available.";
    if (assessmentData.writingScores && assessmentData.writingScores.length > 0) {
      writingFeedback = assessmentData.writingScores
        .filter((score: any) => score.score > 0)
        .map((score: any) => score.feedback)
        .join(" ");
    }
    
    const promptTemplate = `
As an HR AI assistant, create a professional, unbiased 3-4 sentence summary of a job candidate based on their assessment results.

Candidate: ${assessmentData.candidateName}
Position: ${assessmentData.candidatePosition}
Aptitude Score: ${assessmentData.aptitudeScore}/${assessmentData.aptitudeTotal} (${aptitudePercentage}%)
Writing Score: ${assessmentData.overallWritingScore ? `${assessmentData.overallWritingScore}/5 (${writingScorePercentage}%)` : "Not available"}
Overall Score: ${overallScore}%
Writing Feedback: ${writingFeedback}

Your summary should:
1. Highlight the candidate's strengths and potential areas for growth
2. Provide hiring managers with actionable insights based solely on assessment data
3. Be constructive and professional in tone
4. Be concise (3-4 sentences maximum)
5. Focus only on assessment performance, not making assumptions about the candidate's character
`;

    const summaryText = await makeGeminiRequest(promptTemplate, 0.4);
    return summaryText.trim();
  } catch (error) {
    console.error("Error generating candidate summary:", error);
    return "Unable to generate candidate summary at this time. Please try again later.";
  }
};

export const generateStrengthsAndWeaknesses = async (assessmentData: any): Promise<{strengths: string[], weaknesses: string[]}> => {
  try {
    console.log("Generating strengths and weaknesses for:", assessmentData.candidateName);
    
    const aptitudePercentage = assessmentData.aptitudeTotal 
      ? Math.round((assessmentData.aptitudeScore / assessmentData.aptitudeTotal) * 100) 
      : 0;
    
    const writingScorePercentage = assessmentData.overallWritingScore 
      ? Math.round((assessmentData.overallWritingScore / 5) * 100) 
      : 0;
    
    let writingFeedback = "No writing assessment data available.";
    if (assessmentData.writingScores && assessmentData.writingScores.length > 0) {
      writingFeedback = assessmentData.writingScores
        .filter((score: any) => score.score > 0)
        .map((score: any) => score.feedback)
        .join(" ");
    }
    
    const promptTemplate = `
As an HR AI assistant, analyze this candidate's assessment data and identify 3 key strengths and 3 areas for improvement.

Candidate: ${assessmentData.candidateName}
Position: ${assessmentData.candidatePosition}
Aptitude Score: ${assessmentData.aptitudeScore}/${assessmentData.aptitudeTotal} (${aptitudePercentage}%)
Writing Score: ${assessmentData.overallWritingScore ? `${assessmentData.overallWritingScore}/5 (${writingScorePercentage}%)` : "Not available"}
Writing Feedback: ${writingFeedback}

Return your analysis as JSON with the following structure:
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["area for improvement 1", "area for improvement 2", "area for improvement 3"]
}

Each strength and weakness should be 1-2 sentences maximum, specific and actionable.
`;

    const text = await makeGeminiRequest(promptTemplate, 0.3);
    const analysis = parseJsonResponse(text);
    
    return { 
      strengths: analysis.strengths || ["No strengths identified"], 
      weaknesses: analysis.weaknesses || ["No areas for improvement identified"]
    };
  } catch (error) {
    console.error("Error generating strengths and weaknesses:", error);
    return {
      strengths: ["Unable to generate strengths at this time."],
      weaknesses: ["Unable to generate areas for improvement at this time."]
    };
  }
};
