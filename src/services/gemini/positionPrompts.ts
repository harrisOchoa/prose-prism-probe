import { WritingPromptQuestion } from "@/utils/questionBank";
import { makeGeminiRequest, parseJsonResponse } from "./config";

export const generatePositionSpecificPrompts = async (
  position: string,
  count: number = 3,
  skills?: string
): Promise<WritingPromptQuestion[]> => {
  try {
    console.log(`Generating ${count} prompts for position: ${position} with skills: ${skills}`);
    
    const promptTemplate = `
You are an expert hiring manager creating writing assessment prompts for job candidates.

Position: "${position}"
${skills ? `Candidate's Skills & Experience: "${skills}"` : ''}

Your task is to create ${count} writing prompts that are:
1. Highly specific to this position AND the candidate's expertise level
2. Aligned with the skills and experience they've described
3. Designed to test both domain knowledge AND communication skills
4. Crafted to reveal problem-solving approaches and real-world experience
5. Answerable in 300-500 words
6. Open-ended enough to allow different approaches

The prompts should specifically test knowledge and skills directly related to ${position} while staying within the scope of the candidate's described experience level.

Return exactly ${count} prompts as a JSON array with this structure:
{
  "prompts": [
    {
      "id": 1,
      "prompt": "Your first position-specific prompt text here"
    },
    {
      "id": 2,
      "prompt": "Your second position-specific prompt text here"
    },
    {
      "id": 3,
      "prompt": "Your third position-specific prompt text here"
    }
  ]
}
`;

    const text = await makeGeminiRequest(promptTemplate, 0.7);
    const parsedResponse = parseJsonResponse(text);
    
    if (!parsedResponse.prompts || !Array.isArray(parsedResponse.prompts)) {
      throw new Error("Invalid response format from Gemini");
    }
    
    const prompts: WritingPromptQuestion[] = parsedResponse.prompts.map(
      (item: any, index: number) => ({
        id: index + 1,
        prompt: item.prompt
      })
    );
    
    console.log("Generated prompts:", prompts);
    return prompts;
  } catch (error) {
    console.error("Error generating position-specific prompts:", error);
    
    return [
      {
        id: 1,
        prompt: `Describe a challenging situation you faced in a previous ${position} role and how you resolved it. What specific skills and knowledge did you apply?`
      },
      {
        id: 2,
        prompt: `What do you believe are the most important skills and qualifications for success in ${position}? Explain how your experience has prepared you for this role.`
      },
      {
        id: 3,
        prompt: `How do you stay current with industry trends and developments relevant to ${position}? Provide specific examples of how you've applied new knowledge in your work.`
      }
    ];
  }
};
