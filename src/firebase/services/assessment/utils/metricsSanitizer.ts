
import { AntiCheatingMetrics } from '../types';

/**
 * Sanitizes anti-cheating metrics for Firestore storage
 * Ensures all metrics are valid primitive values
 */
export const sanitizeMetricsForFirestore = (metrics: AntiCheatingMetrics | undefined): AntiCheatingMetrics | null => {
  if (!metrics) {
    console.log("No metrics provided to sanitize");
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
  
  try {
    // Create a sanitized copy that only includes primitive values
    const sanitized: AntiCheatingMetrics = {
      keystrokes: metrics.keystrokes || 0,
      pauses: metrics.pauses || 0,
      tabSwitches: metrics.tabSwitches || 0,
      windowBlurs: metrics.windowBlurs || 0,
      windowFocuses: metrics.windowFocuses || 0,
      copyAttempts: metrics.copyAttempts || 0,
      pasteAttempts: metrics.pasteAttempts || 0,
      rightClickAttempts: metrics.rightClickAttempts || 0,
      suspiciousActivity: !!metrics.suspiciousActivity,
      wordsPerMinute: metrics.wordsPerMinute || 0
    };
    
    // Log sanitized metrics
    console.log("Sanitized metrics:", sanitized);
    
    // Convert to JSON and back to ensure it's serializable
    return JSON.parse(JSON.stringify(sanitized));
  } catch (error) {
    console.error("Error sanitizing metrics:", error);
    return null;
  }
};
