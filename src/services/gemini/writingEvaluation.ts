
import { WritingPromptItem } from "@/components/AssessmentManager";
import { WritingScore } from "./types";
import { makeGeminiRequest, parseJsonResponse } from "./config";

export const evaluateWritingResponse = async (prompt: string, userResponse: string): Promise<WritingScore> => {
  try {
    console.log("Starting evaluation for prompt:", prompt.substring(0, 30) + "...");
    console.log("Response length:", userResponse.length, "characters");
    
    const promptTemplate = `
You are an expert writing evaluator for job candidates, with special attention to providing fair but candid feedback and detecting possible AI-generated text. DO NOT use generic, vague, or templated feedback. Each evaluation must be tailored to the specific writing sample and reference unique details.

Your feedback MUST:
- Reference at least one phrase, sentence, or idea from the candidate's response.
- Be honest, constructive, and specific to the individual; do not use canned language.
- Clearly state one strength observed in the writing and one specific area for improvement, even for high or low scores.
- Avoid general phrases such as "The response is relevant to the prompt" or "The writing is simplistic" unless you pair them with clear evidence and further explanation.

Evaluate the following writing response:

1. Writing Quality (1-5 scale, 5 = exemplary)
- Relevance to prompt
- Organization and structure
- Grammar and spelling
- Vocabulary and language use
- Critical thinking and depth of analysis

2. AI Detection
Analyze for signs of AI generation, such as:
- Unnatural patterns, repetition, or generic phrases
- Lack of authentic human characteristics (hesitations, narrative quirks, informal elements)
- Suspicious consistency or over-perfection

Return your evaluation as JSON with this exact structure:
{
  "score": [number between 1-5],
  "feedback": [
    "Write 2-4 sentences. Directly quote or summarize part of the candidate's answer. 
     Include something the candidate did well, and something they could improve, giving actionable feedback. 
     Avoid general or repetitive phrasing."
  ],
  "aiProbability": [number between 0-1 for AI likelihood],
  "aiDetectionNotes": [brief explanation of findings, reference specific sentence or quality if possible],
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"]
}

Writing Prompt: "${prompt}"

Candidate's Response: "${userResponse}"
`;

    console.log("Sending evaluation request to Gemini API...");
    const text = await makeGeminiRequest(promptTemplate, 0.2);
    console.log("Received evaluation response, parsing...");
    const evaluation = parseJsonResponse(text);
    
    console.log("Parsed evaluation:", evaluation);
    const score = Number(evaluation.score);
    if (isNaN(score)) {
      console.error("Invalid score format in response:", evaluation);
      throw new Error("Invalid score format");
    }
    
    return { 
      score,
      feedback: evaluation.feedback || "No feedback provided",
      aiDetection: {
        probability: evaluation.aiProbability || 0,
        notes: evaluation.aiDetectionNotes || "No AI detection notes provided"
      },
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
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
  console.log("Starting evaluation of all writing prompts:", prompts.length, "prompts");
  
  if (!prompts || prompts.length === 0) {
    console.log("No prompts to evaluate");
    return [];
  }
  
  try {
    // Process prompts one at a time to avoid overwhelming the API
    const results: WritingScore[] = [];
    
    for (const prompt of prompts) {
      console.log(`Evaluating prompt ID ${prompt.id}: "${prompt.prompt.substring(0, 30)}..."`);
      try {
        const result = await evaluateWritingResponse(prompt.prompt, prompt.response);
        console.log(`Evaluation completed for prompt ID ${prompt.id}:`, result);
        results.push({ ...result, promptId: prompt.id });
      } catch (error) {
        console.error(`Error evaluating prompt ID ${prompt.id}:`, error);
        results.push({ 
          score: 0, 
          feedback: `Evaluation failed: ${error.message}. Please check manually.`, 
          aiDetection: {
            probability: 0,
            notes: "Evaluation failed"
          },
          promptId: prompt.id 
        });
      }
      
      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("All evaluations completed:", results);
    return results;
  } catch (error) {
    console.error("Error in evaluateAllWritingPrompts:", error);
    return [];
  }
};
