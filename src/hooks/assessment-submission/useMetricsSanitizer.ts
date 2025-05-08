
import { WritingPromptItem } from "@/components/AssessmentManager";
import { AntiCheatingMetrics } from "@/firebase/services/assessment/types";

export const useMetricsSanitizer = (completedPrompts: WritingPromptItem[]) => {
  const sanitizeAntiCheatingMetrics = (metrics?: AntiCheatingMetrics): AntiCheatingMetrics | undefined => {
    if (!metrics) {
      console.log("No metrics to sanitize, creating a basic metrics object");
      return {
        keystrokes: 0,
        pauses: 0,
        tabSwitches: 0,
        windowBlurs: 0,
        windowFocuses: 0,
        copyAttempts: 0,
        pasteAttempts: 0,
        rightClickAttempts: 0,
        suspiciousActivity: false,
        wordsPerMinute: 0
      };
    }
    
    console.log("Original metrics:", metrics);
    
    // Create a sanitized copy with only primitive values and ensure wordsPerMinute exists
    return {
      keystrokes: metrics.keystrokes || 0,
      pauses: metrics.pauses || 0,
      tabSwitches: metrics.tabSwitches || 0,
      windowBlurs: metrics.windowBlurs || 0,
      windowFocuses: metrics.windowFocuses || 0,
      copyAttempts: metrics.copyAttempts || 0,
      pasteAttempts: metrics.pasteAttempts || 0,
      rightClickAttempts: metrics.rightClickAttempts || 0,
      suspiciousActivity: !!metrics.suspiciousActivity,
      wordsPerMinute: metrics.wordsPerMinute || Math.min(70, Math.max(10, completedPrompts.length > 0 ? 
        completedPrompts.reduce((total, prompt) => total + prompt.wordCount, 0) / 5 : 0))
    };
  };
  
  return { sanitizeAntiCheatingMetrics };
};
