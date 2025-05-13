
import { DocumentData } from "firebase/firestore";

// Analysis status types
export type AnalysisStatus = 
  | 'pending'
  | 'writing_evaluated'
  | 'basic_insights_generated' 
  | 'advanced_analysis_started'
  | 'completed' 
  | 'failed'
  | 'rate_limited';

export interface AntiCheatingMetrics {
  keystrokes: number;
  pauses: number;
  wordsPerMinute: number;
  tabSwitches: number;
  suspiciousActivity: boolean;
  copyAttempts?: number;
  pasteAttempts?: number;
  rightClickAttempts?: number;
  keyboardShortcuts?: number;
  windowBlurs?: number;
  windowFocuses?: number;
  suspiciousActivityDetail?: string;
  focusLossEvents?: Array<{timestamp: number, duration: number}>;
  longestFocusLossDuration?: number;
  averageFocusLossDuration?: number;
  suspiciousFocusLoss?: boolean;
  totalInactivityTime?: number;
  focusLost?: number;
  timeAwayFromTab?: number;
  blockedActions?: number;
}

export interface AssessmentSubmission {
  candidateName: string;
  candidatePosition: string;
  candidateNameNormalized: string; // Added for better duplicate detection
  candidatePositionNormalized: string; // Added for better duplicate detection
  aptitudeScore: number;
  aptitudeTotal: number;
  completedPrompts: any[];
  wordCount: number;
  writingScores?: any[];
  overallWritingScore?: number;
  submittedAt: any;
  aiSummary?: string;
  strengths?: string[];
  weaknesses?: string[];
  detailedWritingAnalysis?: any;
  personalityInsights?: any[];
  interviewQuestions?: any[];
  profileMatch?: any;
  aptitudeAnalysis?: any;
  antiCheatingMetrics?: AntiCheatingMetrics | null;
  analysisStatus?: AnalysisStatus;
  analysisError?: string;
  submissionId?: string; // Added for unique submission identification
}
