
import { WritingPromptQuestion } from "@/utils/questionBank";
import { makeGeminiRequest, parseJsonResponse } from "./config";

/**
 * Generates position-specific writing prompts based on the candidate's position
 * @param position The position the candidate is applying for
 * @param count The number of prompts to generate
 * @returns Array of position-specific writing prompts
 */
export const generatePositionSpecificPrompts = async (
  position: string,
  count: number = 3
): Promise<WritingPromptQuestion[]> => {
  try {
    console.log(`Generating ${count} prompts for position: ${position}`);
    
    const promptTemplate = `
You are an expert hiring manager creating writing assessment prompts for job candidates.

Your task is to create ${count} writing prompts that are highly specific to this position: "${position}".

Each prompt should:
1. Be relevant to daily responsibilities and challenges in ${position}
2. Test both domain knowledge AND communication skills
3. Reveal the candidate's problem-solving approaches and real-world experience
4. Be answerable in 300-500 words
5. Be open-ended enough to allow different approaches

Do NOT create generic prompts that could apply to any position.
The prompts should specifically test knowledge and skills directly related to ${position}.

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
    
    // Map the response to our WritingPromptQuestion format
    const prompts: WritingPromptQuestion[] = parsedResponse.prompts.map(
      (item: any, index: number) => ({
        id: index + 1, // Use sequential IDs starting from 1
        prompt: item.prompt
      })
    );
    
    console.log("Generated prompts:", prompts);
    return prompts;
  } catch (error) {
    console.error("Error generating position-specific prompts:", error);
    
    // Fallback to basic position-related questions if Gemini fails
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
