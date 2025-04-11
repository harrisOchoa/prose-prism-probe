
// Define the type for a writing prompt
export interface WritingPromptQuestion {
  id: number;
  prompt: string;
}

// Question bank with 10 diverse writing prompts
export const questionBank: WritingPromptQuestion[] = [
  {
    id: 1,
    prompt: "Describe a situation where effective communication helped resolve a conflict in the workplace. What specific communication strategies were used, and why were they effective?",
  },
  {
    id: 2,
    prompt: "Many companies are adopting remote work policies. Discuss the advantages and disadvantages of remote work from both an employer's and employee's perspective.",
  },
  {
    id: 3,
    prompt: "Explain how technology has changed the way we communicate in professional settings. Include specific examples and discuss whether these changes have been positive or negative overall.",
  },
  {
    id: 4,
    prompt: "Describe a time when you had to adapt to a significant change at work or school. What strategies did you use to navigate this change successfully?",
  },
  {
    id: 5,
    prompt: "Discuss the importance of diversity and inclusion in the workplace. How can organizations create more inclusive environments?",
  },
  {
    id: 6,
    prompt: "What do you consider to be the most important leadership qualities in today's business environment? Provide examples of how these qualities can positively impact an organization.",
  },
  {
    id: 7,
    prompt: "Describe a challenging project you've worked on. What obstacles did you face, and how did you overcome them?",
  },
  {
    id: 8,
    prompt: "How do you approach learning new skills in a rapidly changing job market? Discuss specific strategies you use to stay competitive.",
  },
  {
    id: 9,
    prompt: "Discuss the ethical considerations businesses should take into account when implementing artificial intelligence and automation technologies.",
  },
  {
    id: 10,
    prompt: "Describe your approach to time management and prioritization when dealing with multiple deadlines. How do you ensure all tasks are completed efficiently and effectively?",
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
