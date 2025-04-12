
import { WritingPromptItem } from "@/components/AssessmentManager";

// Scoring criteria with detailed meanings
export const scoringCriteria = {
  1: "Needs Significant Improvement: The response shows limited understanding of the prompt with numerous grammar and structure issues.",
  2: "Basic: The response partially addresses the prompt with several grammatical errors and unclear organization.",
  3: "Satisfactory: The response adequately addresses the prompt with decent structure but some minor grammatical issues.",
  4: "Proficient: The response thoroughly addresses the prompt with clear organization, good vocabulary, and minimal errors.",
  5: "Exceptional: The response comprehensively addresses the prompt with sophisticated vocabulary, flawless grammar, and compelling arguments."
};

export type WritingScore = {
  score: number;
  feedback: string;
  promptId: number;
};

export const evaluateWritingResponse = async (prompt: string, userResponse: string): Promise<WritingScore> => {
  try {
    const apiKey = "AIzaSyApWiYP8pkZKNMrCDKmdbRJVoiWUCANow0";
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    
    const promptTemplate = `
You are an expert writing evaluator for job candidates.
Evaluate the following writing response based on a 5-point scale where:
1: Needs Significant Improvement
2: Basic
3: Satisfactory
4: Proficient
5: Exceptional

Consider the following aspects:
- Relevance to the prompt
- Organization and structure
- Grammar and spelling
- Vocabulary and language use
- Critical thinking and depth of analysis

Writing Prompt: "${prompt}"

Candidate's Response: "${userResponse}"

Return your evaluation as JSON with the following structure:
{
  "score": [score as a number between 1-5],
  "feedback": [2-3 sentences explaining the score and providing constructive feedback]
}
`;

    const apiResponse = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptTemplate
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    const data = await apiResponse.json();
    
    if (!apiResponse.ok) {
      console.error("Gemini API error:", data);
      return { score: 0, feedback: "Error evaluating writing. Please check manually.", promptId: 0 };
    }

    // Extract the JSON from the response text
    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return { score: 0, feedback: "Error parsing AI evaluation. Please check manually.", promptId: 0 };
    }
    
    const evaluation = JSON.parse(jsonMatch[0]);
    return { 
      score: evaluation.score, 
      feedback: evaluation.feedback,
      promptId: 0 // This will be set by the calling function
    };
  } catch (error) {
    console.error("Error evaluating writing:", error);
    return { score: 0, feedback: "Error evaluating writing. Please check manually.", promptId: 0 };
  }
};

export const evaluateAllWritingPrompts = async (prompts: WritingPromptItem[]): Promise<WritingScore[]> => {
  const evaluationPromises = prompts.map(prompt => 
    evaluateWritingResponse(prompt.prompt, prompt.response)
      .then(result => ({ ...result, promptId: prompt.id }))
  );

  return Promise.all(evaluationPromises);
};
