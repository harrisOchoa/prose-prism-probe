
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
  "overallPerformance": "Assessment of ${aptitudePercentage}% performance with specific score reference",
  "cognitiveStrengths": [
    "Strength based on performance level with score citation",
    "Another strength supported by score data"
  ],
  "developmentAreas": [
    "Area for improvement based on score gap with specific reference",
    "Another development area supported by performance data"
  ],
  "roleAlignment": "How ${aptitudePercentage}% performance aligns with ${position} cognitive demands",
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
    const overallPerformance = validateScoreReference(analysisData.overallPerformance) 
      ? analysisData.overallPerformance 
      : `Achieved ${aptitudePercentage}% (${aptitudeScore}/${aptitudeTotal}) on aptitude assessment`;
    
    const cognitiveStrengths = (analysisData.cognitiveStrengths || [])
      .filter(validateScoreReference)
      .slice(0, 2);
    
    const developmentAreas = (analysisData.developmentAreas || [])
      .filter(validateScoreReference)
      .slice(0, 2);
    
    const roleAlignment = validateScoreReference(analysisData.roleAlignment)
      ? analysisData.roleAlignment
      : `${aptitudePercentage}% aptitude performance provides baseline cognitive capability assessment for ${position} role`;
    
    const recommendations = (analysisData.recommendations || [])
      .filter(validateScoreReference)
      .slice(0, 3);
    
    // Add fallbacks if no valid evidence-based content
    if (cognitiveStrengths.length === 0) {
      if (aptitudePercentage >= 70) {
        cognitiveStrengths.push(`Demonstrated solid problem-solving ability with ${aptitudePercentage}% assessment performance`);
      } else {
        cognitiveStrengths.push(`Completed aptitude assessment achieving ${aptitudeScore}/${aptitudeTotal} points`);
      }
    }
    
    if (developmentAreas.length === 0) {
      const gapPoints = aptitudeTotal - aptitudeScore;
      if (gapPoints > 0) {
        developmentAreas.push(`Opportunity to improve analytical performance by ${gapPoints} points (${100 - aptitudePercentage}% improvement potential)`);
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push(`Further assessment may be needed to supplement ${aptitudePercentage}% aptitude performance data`);
    }
    
    return {
      overallPerformance,
      cognitiveStrengths,
      developmentAreas,
      roleAlignment,
      recommendations
    };
  } catch (error) {
    console.error("Error generating aptitude analysis:", error);
    return {
      overallPerformance: "Unable to analyze aptitude performance due to insufficient data",
      cognitiveStrengths: ["Aptitude assessment data not available for analysis"],
      developmentAreas: ["Cannot determine development needs without assessment data"],
      roleAlignment: "Role alignment cannot be assessed without aptitude performance data",
      recommendations: ["Complete aptitude assessment needed for meaningful analysis"]
    };
  }
};
