
import { DocumentData } from "firebase/firestore";

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
}

export interface AssessmentSubmission {
  candidateName: string;
  candidatePosition: string;
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
}
