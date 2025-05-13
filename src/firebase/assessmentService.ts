
// This file exports all assessment service functionality from the modular files
export * from './services/assessment';

// Define and export the AntiCheatingMetrics interface here to resolve import errors
export interface AntiCheatingMetrics {
  tabSwitches: number;
  keystrokes: number;
  pauses: number;
  wordsPerMinute: number;
  suspiciousActivity: boolean;  // Changed from optional to required
  focusLost?: number;
  timeAwayFromTab?: number;
  blockedActions?: number;
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
  // Add other properties as needed by the components using this type
}
