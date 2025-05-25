
import { makeGeminiRequest, parseJsonResponse } from "./config";

export const generateCandidateSummary = async (assessmentData: any): Promise<string> => {
  try {
    console.log("Generating evidence-based candidate summary for:", assessmentData.candidateName);
    
    const aptitudeScore = assessmentData.aptitudeScore || 0;
    const aptitudeTotal = assessmentData.aptitudeTotal || 0;
    const aptitudePercentage = aptitudeTotal > 0 ? Math.round((aptitudeScore / aptitudeTotal) * 100) : 0;
    
    const writingScores = assessmentData.writingScores || [];
    const overallWritingScore = assessmentData.overallWritingScore || 0;
    const writingPercentage = Math.round((overallWritingScore / 5) * 100);
    
    const overallScore = overallWritingScore > 0
      ? Math.round((aptitudePercentage + writingPercentage) / 2)
      : aptitudePercentage;
    
    let writingEvidence = "No writing assessment completed.";
    if (writingScores && writingScores.length > 0) {
      const validScores = writingScores.filter((score: any) => score.score > 0);
      if (validScores.length > 0) {
        writingEvidence = validScores
          .map((score: any) => `Score: ${score.score}/5 - ${score.feedback}`)
          .join(" | ");
      }
    }
    
    const promptTemplate = `
Create a professional, evidence-based summary of this job candidate using ONLY the provided assessment data.

# ASSESSMENT RESULTS
Candidate: ${assessmentData.candidateName}
Position: ${assessmentData.candidatePosition || "Not specified"}
Aptitude Performance: ${aptitudeScore}/${aptitudeTotal} (${aptitudePercentage}%)
Writing Assessment: ${overallWritingScore > 0 ? `${overallWritingScore}/5 (${writingPercentage}%)` : "Not completed"}
Overall Score: ${overallScore}%

Writing Evaluation Evidence: ${writingEvidence}

# SUMMARY REQUIREMENTS
CRITICAL: Base summary ONLY on provided assessment data:

1. **Evidence-Only**: Reference specific scores and performance metrics
2. **No Assumptions**: Do not infer skills, experience, or qualities not measured
3. **Data Citations**: Include actual percentages and scores to support statements
4. **Measurable Focus**: Discuss only what was actually assessed and measured
5. **Professional Tone**: Hiring manager audience, objective and constructive

Structure (3-4 sentences maximum):
- Sentence 1: Overall performance summary with specific scores
- Sentence 2: Key strength based on highest-performing assessment area
- Sentence 3: Area for development based on assessment data (if applicable)
- Sentence 4: Overall recommendation based on measurable performance

AVOID: 
- Personality assessments not based on measurable data
- Skills not demonstrated in assessment
- Work style assumptions
- Character judgments
- Experience or background assumptions

INCLUDE:
- Specific score references (e.g., "scored 85% on aptitude assessment")
- Measurable writing performance indicators
- Objective performance comparisons where data supports
`;

    const summaryText = await makeGeminiRequest(promptTemplate, 0.4);
    
    // Validate that summary includes data references
    const hasDataReferences = summaryText.includes('%') || 
                             summaryText.includes('/') || 
                             summaryText.includes('score') ||
                             summaryText.includes('assessment');
    
    if (!hasDataReferences) {
      console.warn("Generated summary lacks data references, falling back to basic data summary");
      return `${assessmentData.candidateName} completed the assessment for ${assessmentData.candidatePosition || "the specified position"} with an aptitude score of ${aptitudeScore}/${aptitudeTotal} (${aptitudePercentage}%)${overallWritingScore > 0 ? ` and writing score of ${overallWritingScore}/5 (${writingPercentage}%)` : ''}. Overall performance: ${overallScore}%.`;
    }
    
    return summaryText.trim();
  } catch (error) {
    console.error("Error generating candidate summary:", error);
    return `Assessment summary unavailable. ${assessmentData.candidateName} scored ${assessmentData.aptitudeScore || 0}/${assessmentData.aptitudeTotal || 0} on aptitude assessment.`;
  }
};

export const generateStrengthsAndWeaknesses = async (assessmentData: any): Promise<{strengths: string[], weaknesses: string[]}> => {
  try {
    console.log("Generating evidence-based strengths and weaknesses for:", assessmentData.candidateName);
    
    const aptitudeScore = assessmentData.aptitudeScore || 0;
    const aptitudeTotal = assessmentData.aptitudeTotal || 0;
    const aptitudePercentage = aptitudeTotal > 0 ? Math.round((aptitudeScore / aptitudeTotal) * 100) : 0;
    
    const writingScores = assessmentData.writingScores || [];
    const overallWritingScore = assessmentData.overallWritingScore || 0;
    const writingPercentage = Math.round((overallWritingScore / 5) * 100);
    
    let writingEvidence = "No writing assessment data available.";
    if (writingScores && writingScores.length > 0) {
      const validScores = writingScores.filter((score: any) => score.score > 0);
      if (validScores.length > 0) {
        writingEvidence = validScores
          .map((score: any, index: number) => `Response ${index + 1}: ${score.score}/5 - ${score.feedback}`)
          .join(" | ");
      }
    }
    
    const promptTemplate = `
Analyze this candidate's assessment data to identify 3 evidence-based strengths and 3 areas for improvement.

# ASSESSMENT DATA
Candidate: ${assessmentData.candidateName}
Position: ${assessmentData.candidatePosition || "Not specified"}
Aptitude Performance: ${aptitudeScore}/${aptitudeTotal} (${aptitudePercentage}%)
Writing Performance: ${overallWritingScore > 0 ? `${overallWritingScore}/5 (${writingPercentage}%)` : "Not assessed"}

Writing Assessment Details: ${writingEvidence}

# ANALYSIS REQUIREMENTS
CRITICAL: Base ALL strengths and weaknesses on measurable assessment evidence:

1. **Evidence-Based Only**: Each point must reference specific assessment data
2. **Measurable Performance**: Use actual scores, percentages, or evaluation feedback
3. **No Inference**: Do not assume abilities not demonstrated in assessment
4. **Specific Citations**: Include score references or feedback quotes
5. **Assessment-Limited**: Focus only on what was measured

For Strengths:
- Identify high-performing areas with specific scores/percentages
- Reference positive feedback from writing evaluations
- Cite measurable performance indicators

For Weaknesses/Improvement Areas:
- Identify lower-scoring assessment areas with specific data
- Reference specific feedback about writing performance
- Focus on measurable gaps in demonstrated abilities

Each point should:
- Start with specific assessment evidence
- Explain what the data demonstrates
- Be directly tied to measured performance

# FORMAT
Return as JSON:
{
  "strengths": [
    "Strength 1 with specific assessment score/feedback reference",
    "Strength 2 citing measurable performance data", 
    "Strength 3 based on evaluation evidence"
  ],
  "weaknesses": [
    "Improvement area 1 with specific assessment data",
    "Improvement area 2 citing performance metrics",
    "Improvement area 3 based on evaluation feedback"
  ]
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.3);
    const analysisData = parseJsonResponse(text);
    
    // Validate that strengths and weaknesses include assessment references
    const validateEvidenceBased = (items: string[]) => {
      return items.filter(item => 
        item && 
        (item.includes('%') || item.includes('/') || item.includes('score') || 
         item.includes('assessment') || item.includes('evaluation') || item.includes('feedback'))
      );
    };
    
    let strengths = validateEvidenceBased(analysisData.strengths || []);
    let weaknesses = validateEvidenceBased(analysisData.weaknesses || []);
    
    // Fallback to basic data-driven analysis if validation fails
    if (strengths.length === 0) {
      if (aptitudePercentage >= 70) {
        strengths.push(`Strong aptitude performance: scored ${aptitudePercentage}% (${aptitudeScore}/${aptitudeTotal})`);
      }
      if (writingPercentage >= 70) {
        strengths.push(`Effective writing communication: scored ${writingPercentage}% (${overallWritingScore}/5)`);
      }
      if (strengths.length === 0) {
        strengths.push("Assessment data available for evaluation");
      }
    }
    
    if (weaknesses.length === 0) {
      if (aptitudePercentage < 70) {
        weaknesses.push(`Aptitude assessment area for development: scored ${aptitudePercentage}% (${aptitudeScore}/${aptitudeTotal})`);
      }
      if (writingPercentage < 70 && overallWritingScore > 0) {
        weaknesses.push(`Writing assessment area for improvement: scored ${writingPercentage}% (${overallWritingScore}/5)`);
      }
      if (weaknesses.length === 0) {
        weaknesses.push("Areas for development to be determined through additional assessment");
      }
    }
    
    return {
      strengths: strengths.slice(0, 3),
      weaknesses: weaknesses.slice(0, 3)
    };
  } catch (error) {
    console.error("Error generating strengths and weaknesses:", error);
    return {
      strengths: ["Assessment data available for analysis"],
      weaknesses: ["Additional assessment data needed for comprehensive evaluation"]
    };
  }
};
