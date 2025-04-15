import { WritingPromptItem } from "@/components/AssessmentManager";
import { DetailedAnalysis, PersonalityInsight, InterviewQuestion, CandidateProfileMatch, AptitudeAnalysis } from "./types";
import { makeGeminiRequest, parseJsonResponse } from "./config";
import { getRandomAptitudeQuestions } from "@/utils/aptitudeQuestions";

export const generateDetailedWritingAnalysis = async (assessmentData: any): Promise<DetailedAnalysis> => {
  try {
    console.log("Generating detailed writing analysis for:", assessmentData.candidateName);
    
    const writingResponses = assessmentData.completedPrompts
      .map((prompt: WritingPromptItem) => `Prompt: ${prompt.prompt}\nResponse: ${prompt.response}`)
      .join("\n\n---\n\n");
    
    const promptTemplate = `
You are an objective writing analyst for job candidate assessments. Your task is to analyze writing samples in a consistent, fair manner without making assumptions about the candidate.

# WRITING SAMPLES
${writingResponses}

# ANALYSIS INSTRUCTIONS
Analyze only the text provided above. Focus on writing style, vocabulary level, and critical thinking demonstrated in the responses.

Analyze ONLY these specific aspects:
1. Writing style - formal, technical, conversational, etc.
2. Vocabulary level - basic, intermediate, advanced
3. Critical thinking ability - as demonstrated through logical reasoning, analysis, and problem-solving in writing
4. Three specific strength areas 
5. Three specific areas for improvement

Be factual and objective. Base ALL analysis on the text samples provided.
DO NOT make assumptions about the candidate's background, personality, or characteristics that cannot be directly observed in the writing.

# FORMAT
Return your analysis as a JSON object with this exact structure:
{
  "writingStyle": "Description of writing style, 1-2 sentences only",
  "vocabularyLevel": "Assessment of vocabulary level, 1-2 sentences only",
  "criticalThinking": "Evaluation of critical thinking ability, 1-2 sentences only",
  "strengthAreas": ["strength 1 - one brief sentence", "strength 2 - one brief sentence", "strength 3 - one brief sentence"],
  "improvementAreas": ["improvement 1 - one brief sentence", "improvement 2 - one brief sentence", "improvement 3 - one brief sentence"]
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.2);
    const analysis = parseJsonResponse(text);
    
    return { 
      writingStyle: analysis.writingStyle || "Unable to analyze writing style",
      vocabularyLevel: analysis.vocabularyLevel || "Unable to analyze vocabulary level",
      criticalThinking: analysis.criticalThinking || "Unable to analyze critical thinking",
      strengthAreas: analysis.strengthAreas || ["No specific strengths identified"],
      improvementAreas: analysis.improvementAreas || ["No specific areas for improvement identified"]
    };
  } catch (error) {
    console.error("Error generating detailed writing analysis:", error);
    return {
      writingStyle: "Analysis failed",
      vocabularyLevel: "Analysis failed",
      criticalThinking: "Analysis failed",
      strengthAreas: ["Unable to analyze strengths at this time"],
      improvementAreas: ["Unable to analyze areas for improvement at this time"]
    };
  }
};

export const generatePersonalityInsights = async (assessmentData: any): Promise<PersonalityInsight[]> => {
  try {
    console.log("Generating personality insights for:", assessmentData.candidateName);
    
    const writingResponses = assessmentData.completedPrompts
      .map((prompt: WritingPromptItem) => `Prompt: ${prompt.prompt}\nResponse: ${prompt.response}`)
      .join("\n\n---\n\n");
    
    const promptTemplate = `
You are an objective writing style analyst for job candidate assessments. Your task is to analyze writing samples to identify communication styles and tendencies shown in the text.

# WRITING SAMPLES
${writingResponses}

# ANALYSIS INSTRUCTIONS
Analyze ONLY the language patterns and communication tendencies evident in the provided text samples. 
Focus on identifying 5 key communication traits that are objectively demonstrated in the writing.

For each trait:
1. Identify a specific communication tendency or style element displayed in the writing
2. Provide a brief description of how this trait is demonstrated in the text
3. Assess your confidence level (0-100) based on how consistently this trait appears across all samples

Important guidelines:
- Analyze ONLY writing and communication styles, NOT personality traits
- Use neutral, professional language
- Base ALL insights on text evidence, not assumptions
- DO NOT attempt to diagnose personality types or make character judgments
- Provide confidence levels that reflect the evidence strength
- Focus on communication tendencies relevant to professional contexts

# FORMAT
Return your analysis as a JSON object with this exact structure:
{
  "insights": [
    {
      "trait": "Specific communication style element",
      "description": "Brief description of how this is demonstrated in the text",
      "confidence": confidence score as number between 0-100
    },
    ... (4 more traits with the same structure)
  ]
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.2);
    const insightsData = parseJsonResponse(text);
    
    if (!insightsData.insights || !Array.isArray(insightsData.insights)) {
      throw new Error("Invalid insights format");
    }
    
    return insightsData.insights.map((i: any) => ({
      trait: i.trait || "Unknown trait",
      description: i.description || "No description provided",
      confidence: i.confidence || 0
    }));
  } catch (error) {
    console.error("Error generating personality insights:", error);
    return [
      {
        trait: "Unable to analyze personality",
        description: "An error occurred during analysis",
        confidence: 0
      }
    ];
  }
};

export const generateInterviewQuestions = async (assessmentData: any): Promise<InterviewQuestion[]> => {
  try {
    console.log("Generating interview questions for:", assessmentData.candidateName);
    
    const position = assessmentData.candidatePosition || "Not specified";
    const aptitudeScore = assessmentData.aptitudeScore || 0;
    const aptitudeTotal = assessmentData.aptitudeTotal || 0;
    const aptitudePercentage = aptitudeTotal > 0 ? Math.round((aptitudeScore / aptitudeTotal) * 100) : 0;
    const writingScore = assessmentData.overallWritingScore || 0;
    const writingPercentage = Math.round((writingScore / 5) * 100);
    
    let writingFeedback = [];
    if (assessmentData.writingScores && assessmentData.writingScores.length > 0) {
      writingFeedback = assessmentData.writingScores
        .filter((score: any) => score.score > 0)
        .map((score: any) => score.feedback);
    }
    
    const strengths = assessmentData.strengths || [];
    const weaknesses = assessmentData.weaknesses || [];
    
    const promptTemplate = `
You are an objective interview question generator for job candidate assessments. Your task is to generate fair, relevant interview questions based solely on assessment data.

# CANDIDATE ASSESSMENT DATA
Position: ${position}
Aptitude Score: ${aptitudeScore}/${aptitudeTotal} (${aptitudePercentage}%)
Writing Score: ${writingScore}/5 (${writingPercentage}%)

${writingFeedback.length > 0 ? "Writing Feedback:\n- " + writingFeedback.join("\n- ") : "No writing feedback available."}

${strengths.length > 0 ? "Identified Strengths:\n- " + strengths.join("\n- ") : "No specific strengths identified."}
${weaknesses.length > 0 ? "Identified Improvement Areas:\n- " + weaknesses.join("\n- ") : "No specific improvement areas identified."}

# QUESTION GENERATION INSTRUCTIONS
Generate exactly 5 interview questions that:
1. Are directly relevant to the position specified
2. Help validate the candidate's strengths
3. Explore potential improvement areas
4. Include a mix of technical, behavioral, and situational questions appropriate for the position
5. Are specific and focused, not generic

For each question, provide:
- The question text (clear, direct, and professional)
- A brief rationale explaining why this question is important for this specific candidate
- A category (Technical Skills, Problem Solving, Leadership, Communication, Culture Fit, Experience, Behavioral, or Situational)

DO NOT make assumptions about the candidate's background, personality, or characteristics beyond what is provided in the assessment data.

# FORMAT
Return your questions as a JSON array with this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "rationale": "Brief explanation of why this question is relevant",
      "category": "One of the categories listed above"
    },
    ... (4 more questions with the same structure)
  ]
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.3);
    const questionsData = parseJsonResponse(text);
    
    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      throw new Error("Invalid questions format");
    }
    
    return questionsData.questions.map((q: any) => ({
      question: q.question || "Invalid question",
      rationale: q.rationale || "No rationale provided",
      category: q.category || "general"
    }));
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return [
      {
        question: "Unable to generate questions at this time",
        rationale: "An error occurred during generation",
        category: "error"
      }
    ];
  }
};

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
