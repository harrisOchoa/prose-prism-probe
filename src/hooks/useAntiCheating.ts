
import { useState, useEffect } from "react";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

interface TypingMetrics {
  keystrokes: number;
  pauses: number;
  wordsPerMinute: number;
  lastKeystrokeTime: number;
  totalTypingTime: number;
}

/**
 * Hook to track and analyze user behavior during assessments to detect potential cheating
 * Monitors typing patterns, tab switching, and copy/paste attempts
 */
export const useAntiCheating = (response: string) => {
  // State for tracking typing metrics
  const [typingMetrics, setTypingMetrics] = useState<TypingMetrics>({
    keystrokes: 0,
    pauses: 0,
    wordsPerMinute: 0,
    lastKeystrokeTime: Date.now(),
    totalTypingTime: 0,
  });

  // State for tracking tab switching and suspicious activity
  const [tabSwitches, setTabSwitches] = useState(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  const [suspiciousActivityDetail, setSuspiciousActivityDetail] = useState<string | null>(null);

  // Track tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        console.log("Tab switch detected - current count:", tabSwitches + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [tabSwitches]);

  /**
   * Updates typing metrics when a key is pressed
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    const currentTime = Date.now();
    
    setTypingMetrics(prev => {
      // Calculate time since last keystroke
      const timeSinceLastKeystroke = prev.lastKeystrokeTime > 0 
        ? currentTime - prev.lastKeystrokeTime 
        : 0;
      
      // Count as a pause if more than 2 seconds between keystrokes
      const newPauses = timeSinceLastKeystroke > 2000 
        ? prev.pauses + 1 
        : prev.pauses;
      
      // Update keystroke count and total typing time
      const newKeystrokes = prev.keystrokes + 1;
      const newTotalTypingTime = prev.totalTypingTime + timeSinceLastKeystroke;
      
      // Calculate words per minute (assuming 5 keystrokes per word on average)
      const newWordsPerMinute = calculateWordsPerMinute(newKeystrokes, newTotalTypingTime);
      
      const newMetrics = {
        keystrokes: newKeystrokes,
        pauses: newPauses,
        lastKeystrokeTime: currentTime,
        totalTypingTime: newTotalTypingTime,
        wordsPerMinute: newWordsPerMinute,
      };

      // Check for suspicious typing speed patterns
      checkForSuspiciousTypingSpeed(newWordsPerMinute);

      return newMetrics;
    });
  };

  /**
   * Calculates words per minute from keystrokes and typing time
   */
  const calculateWordsPerMinute = (keystrokes: number, totalTimeMs: number): number => {
    if (totalTimeMs <= 0) return 0;
    
    // Formula: (keystrokes / 5) / (time in milliseconds / 60000)
    // 5 keystrokes per word is a common approximation
    return (keystrokes / 5) / (totalTimeMs / 60000);
  };

  /**
   * Checks if typing speed is suspiciously fast
   */
  const checkForSuspiciousTypingSpeed = (wpm: number) => {
    // Average typing speed is 40 WPM, professional typists might hit 80-100 WPM
    // Anything above 120 might be suspicious
    if (wpm > 120) {
      setSuspiciousActivity(true);
      setSuspiciousActivityDetail(`Unusually fast typing speed detected (${wpm.toFixed(0)} WPM). The average professional typing speed is 65-80 WPM.`);
      console.log("Suspicious typing speed detected:", wpm, "WPM");
    }
  };

  /**
   * Prevents copy/paste actions and marks as suspicious
   */
  const preventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    setSuspiciousActivity(true);
    setSuspiciousActivityDetail(`${e.type === 'copy' ? 'Copy' : 'Paste'} attempt detected at ${new Date().toLocaleTimeString()}.`);
    console.log("Copy/paste attempt detected - marked as suspicious activity");
  };

  /**
   * Returns all assessment integrity metrics
   */
  const getAssessmentMetrics = (): AntiCheatingMetrics & { suspiciousActivityDetail?: string } => {
    const metrics: AntiCheatingMetrics & { suspiciousActivityDetail?: string } = {
      keystrokes: typingMetrics.keystrokes,
      pauses: typingMetrics.pauses,
      wordsPerMinute: typingMetrics.wordsPerMinute,
      tabSwitches,
      suspiciousActivity,
    };
    
    // Include details about what triggered the suspicious activity flag
    if (suspiciousActivity && suspiciousActivityDetail) {
      metrics.suspiciousActivityDetail = suspiciousActivityDetail;
    }
    
    console.log("Current anti-cheating metrics:", metrics);
    
    return metrics;
  };

  return {
    handleKeyPress,
    preventCopyPaste,
    getAssessmentMetrics,
    tabSwitches,
    suspiciousActivity,
    suspiciousActivityDetail
  };
};
