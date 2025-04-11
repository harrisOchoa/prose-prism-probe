
// Define the type for a writing prompt
export interface WritingPromptQuestion {
  id: number;
  prompt: string;
}

// Question bank with 10 diverse writing prompts that are relatable to people from various backgrounds
export const questionBank: WritingPromptQuestion[] = [
  {
    id: 1,
    prompt: "Describe a situation where you successfully communicated with someone despite a misunderstanding. What strategies did you use, and what did you learn from this experience?",
  },
  {
    id: 2,
    prompt: "Many aspects of daily life have changed with technology. Discuss how technology has impacted your daily routine, and include both positive and negative effects you've experienced.",
  },
  {
    id: 3,
    prompt: "Think about a time when you had to learn something new. What challenges did you face, and what techniques helped you learn effectively?",
  },
  {
    id: 4,
    prompt: "Describe a situation where you had to adapt to an unexpected change. How did you handle it, and what did this experience teach you about flexibility?",
  },
  {
    id: 5,
    prompt: "Everyone has different strengths and perspectives. Describe how you've benefited from working or interacting with people who are different from you.",
  },
  {
    id: 6,
    prompt: "What qualities do you think make someone a good team member? Provide examples of how these qualities have been important in your own experiences.",
  },
  {
    id: 7,
    prompt: "Describe a challenging project or task you've worked on. What obstacles did you face, and how did you overcome them?",
  },
  {
    id: 8,
    prompt: "How do you approach learning new skills? Discuss specific strategies you use when faced with something unfamiliar.",
  },
  {
    id: 9,
    prompt: "Many decisions involve ethical considerations. Describe a situation where you had to make a difficult choice, and explain how you decided what to do.",
  },
  {
    id: 10,
    prompt: "How do you manage your time when you have multiple responsibilities or tasks? Describe specific techniques that work for you.",
  }
];

/**
 * Gets a shuffled selection of questions from the question bank
 * @param count Number of questions to select
 * @returns Array of randomly selected questions
 */
export const getRandomQuestions = (count: number): WritingPromptQuestion[] => {
  // Make a copy of the question bank to avoid modifying the original
  const shuffledQuestions = [...questionBank];
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffledQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
  }
  
  // Return the first 'count' questions or all if count > questionBank.length
  return shuffledQuestions.slice(0, Math.min(count, shuffledQuestions.length));
};
