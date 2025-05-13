
// This file exports all assessment service functionality from the modular files
export * from './services/assessment';

// Define and export the AntiCheatingMetrics interface here to resolve import errors
export interface AntiCheatingMetrics {
  tabSwitches: number;
  suspiciousActivity?: boolean;
  focusLost?: number;
  timeAwayFromTab?: number;
  blockedActions?: number;
  // Add other properties as needed by the components using this type
}
