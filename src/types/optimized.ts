
// Strict type definitions to replace 'any' types
export interface StrictAssessmentData {
  id: string;
  candidateName: string;
  candidatePosition: string;
  candidateSkills?: string[];
  aptitudeScore: number;
  aptitudeTotal: number;
  aptitudeResults?: AptitudeResult[];
  aptitudeCategories?: AptitudeCategory[];
  writingScores?: WritingScore[];
  writingPrompts?: WritingPrompt[];
  writingResponses?: WritingResponse[];
  overallWritingScore?: number;
  aiSummary?: string;
  strengths?: string[];
  weaknesses?: string[];
  antiCheatingMetrics?: AntiCheatingMetrics;
  advancedAnalysis?: AdvancedAnalysis;
  analysisStatus?: AnalysisStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface AptitudeResult {
  questionId: string;
  selectedOption: number;
  correctOption: number;
  isCorrect: boolean;
  category: string;
  timeSpent?: number;
}

export interface AptitudeCategory {
  name: string;
  score: number;
  total: number;
  percentage: number;
}

export interface WritingScore {
  score: number;
  feedback?: string;
  criteria?: ScoringCriteria;
  aiDetectionWarning?: boolean;
}

export interface ScoringCriteria {
  clarity: number;
  coherence: number;
  grammar: number;
  vocabulary: number;
  argumentation: number;
}

export interface WritingPrompt {
  id: string;
  text: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface WritingResponse {
  text: string;
  wordCount: number;
  timeSpent?: number;
  submittedAt?: Date | string;
}

export interface AntiCheatingMetrics {
  tabSwitches: number;
  windowBlurs: number;
  suspiciousActivity: boolean;
  timeSpentMs: number;
  wordsPerMinute?: number;
  keystrokes?: number;
  totalTypingTime?: number;
}

export interface AdvancedAnalysis {
  aptitudeAnalysis?: string;
  writingAnalysis?: string;
  personalityInsights?: string;
  profileMatch?: string;
  interviewQuestions?: string[];
}

export type AnalysisStatus = 
  | 'pending'
  | 'writing_evaluated'
  | 'generating_insights'
  | 'generating_advanced'
  | 'completed'
  | 'failed';

// Error types for better error handling
export interface AssessmentError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ApiResponse<T> {
  data?: T;
  error?: AssessmentError;
  loading: boolean;
  timestamp: Date;
}

// Performance monitoring types
export interface PerformanceMetrics {
  componentRenderTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  memoryUsage?: number;
}
