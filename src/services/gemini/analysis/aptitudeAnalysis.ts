
import { AptitudeAnalysis } from "../types";
import { makeGeminiRequest, parseJsonResponse } from "../config";
import { getRandomAptitudeQuestions } from "@/utils/aptitudeQuestions";

export const generateAptitudeAnalysis = async (assessmentData: any): Promise<AptitudeAnalysis> => {
  try {
    console.log("Generating aptitude analysis for:", assessmentData.candidateName);
    
    const aptitudeScore = assessmentData.aptitudeScore || 0;
    const aptitudeTotal = assessmentData.aptitudeTotal || 0;
    const aptitudePercentage = aptitudeTotal > 0 ? Math.round((aptitudeScore / aptitudeTotal) * 100) : 0;
    
    const allQuestions = getRandomAptitudeQuestions(30);
    
    const promptTemplate = `
You are an objective aptitude test analyzer for job candidate assessments. Your task is to analyze aptitude test performance and provide insights.

# CANDIDATE APTITUDE DATA
Score: ${aptitudeScore}/${aptitudeTotal} (${aptitudePercentage}%)

Test Questions Categories:
${allQuestions.map(q => `- ${q.question}`).join('\n')}

# ANALYSIS INSTRUCTIONS
Analyze the candidate's aptitude test performance to:
1. Identify categories where the candidate showed strength
2. Identify categories that need improvement
3. Provide specific recommendations for improvement
4. Give an overall performance assessment

# FORMAT
Return your analysis as a JSON object with this exact structure:
{
  "strengthCategories": ["category 1", "category 2", "category 3"],
  "weaknessCategories": ["category 1", "category 2", "category 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4"],
  "performance": "A concise 2-3 sentence overview of the candidate's performance"
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.3);
    const analysis = parseJsonResponse(text);
    
    return {
      strengthCategories: analysis.strengthCategories || ["No specific strengths identified"],
      weaknessCategories: analysis.weaknessCategories || ["No specific areas identified"],
      recommendations: analysis.recommendations || ["No specific recommendations available"],
      performance: analysis.performance || "Unable to analyze performance"
    };
  } catch (error) {
    console.error("Error generating aptitude analysis:", error);
    return {
      strengthCategories: ["Analysis failed"],
      weaknessCategories: ["Analysis failed"],
      recommendations: ["Unable to generate recommendations at this time"],
      performance: "An error occurred during analysis"
    };
  }
};
