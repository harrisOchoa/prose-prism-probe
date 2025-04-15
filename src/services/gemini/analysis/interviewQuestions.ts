
import { WritingPromptItem } from "@/components/AssessmentManager";
import { InterviewQuestion } from "../types";
import { makeGeminiRequest, parseJsonResponse } from "../config";

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
