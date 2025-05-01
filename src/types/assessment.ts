
import { QueryDocumentSnapshot } from "firebase/firestore";
import { WritingScore } from "@/services/gemini/types";
import { WritingPromptItem } from "@/components/AssessmentManager";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

export interface AssessmentData {
  id: string;
  candidateName: string;
  candidatePosition: string;
  aptitudeScore?: number;
  aptitudeTotal?: number;
  aptitudeAnswers?: any[];
  aptitudeData?: {
    correctAnswers?: number;
  };
  wordCount: number;
  overallWritingScore?: number;
  submittedAt: any;
  completedPrompts?: WritingPromptItem[];
  writingScores?: WritingScore[];
  aiSummary?: string;
  strengths?: string[];
  weaknesses?: string[];
  detailedWritingAnalysis?: any;
  personalityInsights?: any[];
  interviewQuestions?: any[];
  profileMatch?: any;
  antiCheatingMetrics?: AntiCheatingMetrics;
  [key: string]: any;
}

export interface AssessmentPaginationState {
  lastVisible: QueryDocumentSnapshot | null;
  hasMore: boolean;
  loading: boolean;
}

export interface AssessmentFilters {
  searchTerm: string;
  currentPage: number;
}
