
export type WritingScore = {
  score: number;
  feedback: string;
  promptId: number;
};

export type PersonalityInsight = {
  trait: string;
  description: string;
  confidence: number;
};

export type InterviewQuestion = {
  question: string;
  rationale: string;
  category: string;
};

export type DetailedAnalysis = {
  writingStyle: string;
  vocabularyLevel: string;
  criticalThinking: string;
  strengthAreas: string[];
  improvementAreas: string[];
};

export type CandidateProfileMatch = {
  position: string;
  matchPercentage: number;
  keyMatches: string[];
  keyGaps: string[];
};

// Scoring criteria with detailed meanings
export const scoringCriteria = {
  1: "Needs Significant Improvement: The response shows limited understanding of the prompt with numerous grammar and structure issues.",
  2: "Basic: The response partially addresses the prompt with several grammatical errors and unclear organization.",
  3: "Satisfactory: The response adequately addresses the prompt with decent structure but some minor grammatical issues.",
  4: "Proficient: The response thoroughly addresses the prompt with clear organization, good vocabulary, and minimal errors.",
  5: "Exceptional: The response comprehensively addresses the prompt with sophisticated vocabulary, flawless grammar, and compelling arguments."
};
