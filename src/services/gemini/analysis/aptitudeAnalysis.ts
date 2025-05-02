
import { AptitudeAnalysis } from "../types";
import { makeGeminiRequest, parseJsonResponse } from "../config";
import { getRandomAptitudeQuestions } from "@/utils/aptitudeQuestions";

export const generateAptitudeAnalysis = async (assessmentData: any): Promise<AptitudeAnalysis> => {
  try {
    console.log("Generating aptitude analysis for:", assessmentData.candidateName);
    
    const aptitudeScore = assessmentData.aptitudeScore || 0;
    const aptitudeTotal = assessmentData.aptitudeTotal || 0;
    const aptitudePercentage = aptitudeTotal > 0 ? Math.round((aptitudeScore / aptitudeTotal) * 100) : 0;
    
    // Get all possible aptitude questions to understand categories being tested
    const allQuestions = getRandomAptitudeQuestions(30);
    const questionCategories = [...new Set(allQuestions.map(q => q.category))].join(", ");
    
    const promptTemplate = `
You are an expert aptitude test analyzer for job candidate assessments. Your task is to provide an objective, accurate, and realistic analysis of a candidate's aptitude test performance.

# CANDIDATE APTITUDE DATA
Score: ${aptitudeScore}/${aptitudeTotal} (${aptitudePercentage}%)

# TESTED CATEGORIES
The test covered the following categories: ${questionCategories}

# ANALYSIS INSTRUCTIONS
Analyze the candidate's aptitude test performance with the following considerations:

1. REALISTIC STRENGTHS ASSESSMENT:
   - If the candidate scored below 40%, do NOT list any strength categories unless there's clear evidence of them
   - If the candidate scored 40-60%, identify only 1-2 potential areas of relative strength if any
   - For scores above 60%, identify 2-4 strength areas
   - For scores above 80%, identify 3-5 strength areas

2. WEAKNESSES ASSESSMENT:
   - For low scores (below 40%), focus on fundamental skill gaps and most critical areas for improvement
   - Prioritize weaknesses by impact on overall performance
   - Keep the weakness list proportionate to performance (more weaknesses for lower scores)
   - For high scores (above 80%), only identify minor areas for refinement

3. RECOMMENDATIONS:
   - Provide 3-5 specific, actionable recommendations tailored to the score level
   - For low scores, focus on foundational skill building
   - For medium scores, focus on targeted improvements
   - For high scores, focus on mastery and advanced concepts
   - Include resources or methods for improvement

4. PERFORMANCE SUMMARY:
   - Provide an honest but constructive 2-3 sentence assessment
   - For low scores, acknowledge challenges while being encouraging
   - For high scores, acknowledge strengths while suggesting refinement
   - Be specific about performance level (e.g., "strong", "adequate", "needs significant improvement")

# FORMAT
Return your analysis as a JSON object with this exact structure:
{
  "strengthCategories": ["category 1", "category 2", ...],
  "weaknessCategories": ["category 1", "category 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", ...],
  "performance": "A concise 2-3 sentence overview of the candidate's performance"
}

IMPORTANT NOTES:
- If the candidate performed poorly (below 40%), it's appropriate to have an empty or very small strengthCategories array
- Your analysis should be proportionate to the score - don't artificially inflate strengths for poor performers
- Be realistic but constructive - identify genuine issues without being discouraging
- Base your analysis only on the given score and categories, don't make assumptions about specific questions answered
`;

    const text = await makeGeminiRequest(promptTemplate, 0.3);
    const analysis = parseJsonResponse(text);
    
    return {
      strengthCategories: analysis.strengthCategories || [],
      weaknessCategories: analysis.weaknessCategories || ["Fundamental aptitude concepts"],
      recommendations: analysis.recommendations || ["Focus on building core knowledge and skills"],
      performance: analysis.performance || "The assessment indicates areas that need improvement."
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
