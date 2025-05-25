
export interface AIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  generateWritingEvaluation(prompts: any[]): Promise<any[]>;
  generateCandidateSummary(assessmentData: any): Promise<string>;
  generateStrengthsAndWeaknesses(assessmentData: any): Promise<{ strengths: string[], weaknesses: string[] }>;
  generateDetailedWritingAnalysis(assessmentData: any): Promise<any>;
  generatePersonalityInsights(assessmentData: any): Promise<any>;
  generateInterviewQuestions(assessmentData: any): Promise<any>;
  generateProfileMatch(assessmentData: any): Promise<any>;
  generateAptitudeAnalysis(assessmentData: any): Promise<any>;
}

export interface AIServiceConfig {
  primaryProvider: AIProvider;
  fallbackProviders: AIProvider[];
  maxRetries: number;
  retryDelay: number;
}

export interface AIResponse<T = any> {
  data: T;
  provider: string;
  success: boolean;
  error?: string;
}
