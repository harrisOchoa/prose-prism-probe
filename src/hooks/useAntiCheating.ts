
import { useState, useEffect } from "react";

interface TypingMetrics {
  keystrokes: number;
  pauses: number;
  averageTypingSpeed: number;
  lastKeystrokeTime: number;
  totalTypingTime: number;
}

export const useAntiCheating = (response: string) => {
  const [typingMetrics, setTypingMetrics] = useState<TypingMetrics>({
    keystrokes: 0,
    pauses: 0,
    averageTypingSpeed: 0,
    lastKeystrokeTime: 0,
    totalTypingTime: 0,
  });

  const [tabSwitches, setTabSwitches] = useState(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);

  // Track tab switching silently (without toast notifications)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        // Removed toast notification to make tab switch tracking silent
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Handle typing metrics
  const handleKeyPress = (e: React.KeyboardEvent) => {
    const currentTime = Date.now();
    
    setTypingMetrics(prev => {
      const timeSinceLastKeystroke = currentTime - prev.lastKeystrokeTime;
      const newPauses = timeSinceLastKeystroke > 2000 ? prev.pauses + 1 : prev.pauses;
      
      const newMetrics = {
        keystrokes: prev.keystrokes + 1,
        pauses: newPauses,
        lastKeystrokeTime: currentTime,
        totalTypingTime: prev.totalTypingTime + timeSinceLastKeystroke,
        averageTypingSpeed: (prev.keystrokes + 1) / ((prev.totalTypingTime + timeSinceLastKeystroke) / 1000),
      };

      // Check for suspicious patterns
      if (newMetrics.averageTypingSpeed > 7) { // More than 7 characters per second is suspicious
        setSuspiciousActivity(true);
      }

      return newMetrics;
    });
  };

  const preventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    // Silently prevent copy/paste without notification
  };

  const getAssessmentMetrics = () => ({
    keystrokes: typingMetrics.keystrokes,
    pauses: typingMetrics.pauses,
    averageTypingSpeed: typingMetrics.averageTypingSpeed,
    tabSwitches,
    suspiciousActivity,
  });

  return {
    handleKeyPress,
    preventCopyPaste,
    getAssessmentMetrics,
    tabSwitches,
    suspiciousActivity,
  };
};
