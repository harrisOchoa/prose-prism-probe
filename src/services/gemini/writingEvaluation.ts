import { WritingPromptItem } from "@/components/AssessmentManager";
import { WritingScore } from "./types";
import { makeGeminiRequest, parseJsonResponse } from "./config";

export const evaluateWritingResponse = async (prompt: string, userResponse: string): Promise<WritingScore> => {
  try {
    console.log("Starting evaluation for prompt:", prompt.substring(0, 30) + "...");
    console.log("Response length:", userResponse.length, "characters");
    
    const promptTemplate = `
You are an expert writing evaluator for job candidates with expertise in detecting AI-generated text.
Evaluate the following writing response based on these criteria:

1. Writing Quality (1-5 scale where 5 is best)
- Relevance to prompt
- Organization and structure
- Grammar and spelling
- Vocabulary and language use
- Critical thinking and depth of analysis

2. AI Detection
Analyze the text for indicators of AI generation such as:
- Unnatural writing patterns
- Overly perfect structure
- Lack of human writing characteristics (hesitations, self-corrections, informal elements)
- Repetitive or templated phrases
- Unusual consistency in style

Return your evaluation as JSON with this structure:
{
  "score": [score as a number between 1-5],
  "feedback": [2-3 sentences explaining the score],
  "aiProbability": [number between 0-1 indicating likelihood of AI generation],
  "aiDetectionNotes": [brief explanation of AI detection findings]
}

Writing Prompt: "${prompt}"

Candidate's Response: "${userResponse}"
`;

    const text = await makeGeminiRequest(promptTemplate, 0.2);
    const evaluation = parseJsonResponse(text);
    
    const score = Number(evaluation.score);
    if (isNaN(score)) {
      throw new Error("Invalid score format");
    }
    
    return { 
      score,
      feedback: evaluation.feedback || "No feedback provided",
      aiDetection: {
        probability: evaluation.aiProbability || 0,
        notes: evaluation.aiDetectionNotes || "No AI detection notes provided"
      },
      promptId: 0
    };
  } catch (error) {
    console.error("Error evaluating writing:", error);
    return { 
      score: 0, 
      feedback: `Error evaluating writing: ${error.message}. Please check manually.`, 
      aiDetection: {
        probability: 0,
        notes: "AI detection failed"
      },
      promptId: 0 
    };
  }
};

export const evaluateAllWritingPrompts = async (prompts: WritingPromptItem[]): Promise<WritingScore[]> => {
  console.log("Starting evaluation of all writing prompts:", prompts);
  
  if (!prompts || prompts.length === 0) {
    console.log("No prompts to evaluate");
    return [];
  }
  
  try {
    const evaluationPromises = prompts.map(prompt => {
      console.log(`Evaluating prompt ID ${prompt.id}: "${prompt.prompt.substring(0, 30)}..."`);
      return evaluateWritingResponse(prompt.prompt, prompt.response)
        .then(result => {
          console.log(`Evaluation completed for prompt ID ${prompt.id}:`, result);
          return { ...result, promptId: prompt.id };
        })
        .catch(error => {
          console.error(`Error evaluating prompt ID ${prompt.id}:`, error);
          return { 
            score: 0, 
            feedback: `Evaluation failed: ${error.message}. Please check manually.`, 
            promptId: prompt.id 
          };
        });
    });

    const results = await Promise.all(evaluationPromises);
    console.log("All evaluations completed:", results);
    return results;
  } catch (error) {
    console.error("Error in evaluateAllWritingPrompts:", error);
    return [];
  }
};
