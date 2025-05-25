
import { AptitudeAnalysis } from "../types";
import { makeGeminiRequest, parseJsonResponse } from "../config";

export const generateAptitudeAnalysis = async (assessmentData: any): Promise<AptitudeAnalysis> => {
  try {
    console.log("Generating evidence-based aptitude analysis for:", assessmentData.candidateName);
    
    const aptitudeScore = assessmentData.aptitudeScore || 0;
    const aptitudeTotal = assessmentData.aptitudeTotal || 0;
    const aptitudePercentage = aptitudeTotal > 0 ? Math.round((aptitudeScore / aptitudeTotal) * 100) : 0;
    const position = assessmentData.candidatePosition || "Not specified";
    
    if (aptitudeTotal === 0) {
      throw new Error("No aptitude assessment data available for analysis");
    }
    
    const promptTemplate = `
Analyze this candidate's aptitude assessment performance using ONLY the provided score data.

# APTITUDE ASSESSMENT DATA
Position Applied For: ${position}
Aptitude Score: ${aptitudeScore}/${aptitudeTotal} (${aptitudePercentage}%)

# ANALYSIS REQUIREMENTS
CRITICAL: Base analysis ONLY on the numerical performance data provided:

1. **Score-Based Only**: Use only the actual score and percentage for analysis
2. **No Category Assumptions**: Do not assume performance in specific aptitude areas unless data is provided
3. **Performance Level**: Assess overall cognitive problem-solving based on percentage score
4. **Evidence-Required**: Every statement must reference the actual score data
5. **Position Relevance**: Connect score to cognitive demands only when directly relevant

Analysis Framework:
- Performance Assessment: Based solely on ${aptitudePercentage}% achievement
- Cognitive Indicators: What the score suggests about problem-solving capability
- Role Alignment: How this performance level relates to ${position} cognitive requirements
- Development Areas: Based on score gap from maximum performance

Scoring Interpretation Guidelines:
- 90-100%: Exceptional cognitive performance
- 80-89%: Strong problem-solving abilities  
- 70-79%: Adequate analytical skills
- 60-69%: Developing problem-solving capabilities
- Below 60%: Significant improvement needed in analytical thinking

# FORMAT
Return as JSON:
{
  "performance": "Assessment of ${aptitudePercentage}% performance with specific score reference",
  "strengthCategories": [
    "Strength based on performance level with score citation",
    "Another strength supported by score data"
  ],
  "weaknessCategories": [
    "Area for improvement based on score gap with specific reference",
    "Another development area supported by performance data"
  ],
  "recommendations": [
    "Specific recommendation based on actual performance level",
    "Development suggestion tied to score data"
  ]
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.2);
    const analysisData = parseJsonResponse(text);
    
    // Validate that analysis includes score references
    const validateScoreReference = (text: string) => {
      return text && (text.includes('%') || text.includes('/') || text.includes('score') || text.includes(aptitudeScore.toString()));
    };
    
    // Ensure all analysis components reference the actual score
    const performance = validateScoreReference(analysisData.performance) 
      ? analysisData.performance 
      : `Achieved ${aptitudePercentage}% (${aptitudeScore}/${aptitudeTotal}) on aptitude assessment`;
    
    const strengthCategories = (analysisData.strengthCategories || [])
      .filter(validateScoreReference)
      .slice(0, 2);
    
    const weaknessCategories = (analysisData.weaknessCategories || [])
      .filter(validateScoreReference)
      .slice(0, 2);
    
    const recommendations = (analysisData.recommendations || [])
      .filter(validateScoreReference)
      .slice(0, 3);
    
    // Add fallbacks if no valid evidence-based content
    if (strengthCategories.length === 0) {
      if (aptitudePercentage >= 70) {
        strengthCategories.push(`Demonstrated solid problem-solving ability with ${aptitudePercentage}% assessment performance`);
      } else {
        strengthCategories.push(`Completed aptitude assessment achieving ${aptitudeScore}/${aptitudeTotal} points`);
      }
    }
    
    if (weaknessCategories.length === 0) {
      const gapPoints = aptitudeTotal - aptitudeScore;
      if (gapPoints > 0) {
        weaknessCategories.push(`Opportunity to improve analytical performance by ${gapPoints} points (${100 - aptitudePercentage}% improvement potential)`);
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push(`Further assessment may be needed to supplement ${aptitudePercentage}% aptitude performance data`);
    }
    
    return {
      performance,
      strengthCategories,
      weaknessCategories,
      recommendations
    };
  } catch (error) {
    console.error("Error generating aptitude analysis:", error);
    return {
      performance: "Unable to analyze aptitude performance due to insufficient data",
      strengthCategories: ["Aptitude assessment data not available for analysis"],
      weaknessCategories: ["Cannot determine development needs without assessment data"],
      recommendations: ["Complete aptitude assessment needed for meaningful analysis"]
    };
  }
};
