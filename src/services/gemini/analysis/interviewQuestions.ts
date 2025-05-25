
import { InterviewQuestion } from "../types";
import { makeGeminiRequest, parseJsonResponse } from "../config";

export const generateInterviewQuestions = async (assessmentData: any): Promise<InterviewQuestion[]> => {
  try {
    console.log("Generating evidence-based interview questions for:", assessmentData.candidateName);
    
    const position = assessmentData.candidatePosition || "Not specified";
    const aptitudeScore = assessmentData.aptitudeScore || 0;
    const aptitudeTotal = assessmentData.aptitudeTotal || 0;
    const aptitudePercentage = aptitudeTotal > 0 ? Math.round((aptitudeScore / aptitudeTotal) * 100) : 0;
    const writingScore = assessmentData.overallWritingScore || 0;
    const writingPercentage = Math.round((writingScore / 5) * 100);
    
    // Get specific writing feedback for evidence
    let writingFeedback: string[] = [];
    if (assessmentData.writingScores && assessmentData.writingScores.length > 0) {
      writingFeedback = assessmentData.writingScores
        .filter((score: any) => score.score > 0)
        .map((score: any, index: number) => `Response ${index + 1} (${score.score}/5): ${score.feedback}`);
    }
    
    const strengths = assessmentData.strengths || [];
    const weaknesses = assessmentData.weaknesses || [];
    
    const promptTemplate = `
Generate interview questions based ONLY on this candidate's actual assessment performance to validate and explore their demonstrated abilities.

# CANDIDATE ASSESSMENT EVIDENCE
Position: ${position}
Aptitude Performance: ${aptitudeScore}/${aptitudeTotal} (${aptitudePercentage}%)
Writing Performance: ${writingScore}/5 (${writingPercentage}%)

${writingFeedback.length > 0 ? "Writing Assessment Feedback:\n" + writingFeedback.join("\n") : "No detailed writing feedback available"}

${strengths.length > 0 ? "Identified Strengths (based on assessment):\n- " + strengths.join("\n- ") : "No specific strengths identified"}
${weaknesses.length > 0 ? "Areas for Development (based on assessment):\n- " + weaknesses.join("\n- ") : "No specific development areas identified"}

# QUESTION GENERATION REQUIREMENTS
CRITICAL: Generate questions that directly relate to assessment findings:

1. **Assessment-Based**: Each question must connect to specific assessment performance
2. **Evidence-Driven**: Reference actual scores, feedback, or identified patterns
3. **Validation-Focused**: Help verify or explore assessment findings
4. **Role-Relevant**: Connect assessment performance to ${position} requirements only when directly applicable
5. **Specific Follow-up**: Probe areas where assessment shows strengths or gaps

Question Types to Include:
- **Performance Validation**: Questions that help confirm assessment findings
- **Strength Exploration**: Dive deeper into high-performing assessment areas  
- **Gap Clarification**: Explore areas where assessment showed development needs
- **Application Questions**: How they would apply demonstrated skills in role context
- **Communication Follow-up**: Based on writing assessment feedback

Each question should:
- Reference specific assessment evidence in the rationale
- Help hiring manager understand the candidate's actual demonstrated abilities
- Validate or explore assessment findings rather than assume new competencies

# FORMAT
Return as JSON:
{
  "questions": [
    {
      "question": "Specific question based on assessment evidence",
      "rationale": "Explanation referencing specific assessment data (scores, feedback, performance)",
      "category": "Performance Validation | Strength Exploration | Gap Clarification | Communication | Application"
    },
    ... (exactly 5 questions)
  ]
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.3);
    const questionsData = parseJsonResponse(text);
    
    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      throw new Error("Invalid questions format received");
    }
    
    // Validate that questions reference assessment data
    const validateEvidenceBased = (question: any) => {
      const rationale = question.rationale || "";
      return rationale.includes('%') || 
             rationale.includes('/') || 
             rationale.includes('score') || 
             rationale.includes('assessment') || 
             rationale.includes('feedback') ||
             rationale.includes('performance');
    };
    
    let validQuestions = questionsData.questions.filter(validateEvidenceBased);
    
    // If no evidence-based questions, generate basic assessment follow-ups
    if (validQuestions.length === 0) {
      validQuestions = [
        {
          question: `Your aptitude assessment showed a score of ${aptitudePercentage}%. Can you walk me through your problem-solving approach?`,
          rationale: `Based on aptitude score of ${aptitudeScore}/${aptitudeTotal}, explore their analytical process`,
          category: "Performance Validation"
        },
        {
          question: `In your writing assessment, you scored ${writingPercentage}%. How do you typically approach written communication in a professional setting?`,
          rationale: `Writing score of ${writingScore}/5 indicates need to understand their communication process`,
          category: "Communication"
        }
      ];
    }
    
    // Ensure we have exactly 5 questions
    while (validQuestions.length < 5) {
      validQuestions.push({
        question: "Based on your assessment performance, can you describe a time when you had to learn something quickly?",
        rationale: "General follow-up to understand learning approach given assessment results",
        category: "Application"
      });
    }
    
    return validQuestions.slice(0, 5).map((q: any) => ({
      question: q.question || "Assessment follow-up question",
      rationale: q.rationale || "Based on assessment performance",
      category: q.category || "General"
    }));
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return [
      {
        question: "Unable to generate questions based on assessment data",
        rationale: "Technical error occurred during question generation",
        category: "Error"
      }
    ];
  }
};
