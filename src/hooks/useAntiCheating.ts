
import { useState, useEffect } from "react";

interface TypingMetrics {
  keystrokes: number;
  pauses: number;
  wordsPerMinute: number;
  lastKeystrokeTime: number;
  totalTypingTime: number;
}

export const useAntiCheating = (response: string) => {
  const [typingMetrics, setTypingMetrics] = useState<TypingMetrics>({
    keystrokes: 0,
    pauses: 0,
    wordsPerMinute: 0,
    lastKeystrokeTime: Date.now(), // Initialize with current time
    totalTypingTime: 0,
  });

  const [tabSwitches, setTabSwitches] = useState(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);

  // Track tab switching silently (without toast notifications)
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

  // Handle typing metrics
  const handleKeyPress = (e: React.KeyboardEvent) => {
    const currentTime = Date.now();
    
    setTypingMetrics(prev => {
      const timeSinceLastKeystroke = prev.lastKeystrokeTime > 0 ? currentTime - prev.lastKeystrokeTime : 0;
      const newPauses = timeSinceLastKeystroke > 2000 ? prev.pauses + 1 : prev.pauses;
      
      const newKeystrokes = prev.keystrokes + 1;
      const newTotalTypingTime = prev.totalTypingTime + timeSinceLastKeystroke;
      
      // Calculate words per minute (assuming 5 keystrokes per word on average)
      // Formula: (keystrokes / 5) / (time in milliseconds / 60000)
      const newWordsPerMinute = newTotalTypingTime > 0 
        ? ((newKeystrokes / 5) / (newTotalTypingTime / 60000))
        : 0;
      
      const newMetrics = {
        keystrokes: newKeystrokes,
        pauses: newPauses,
        lastKeystrokeTime: currentTime,
        totalTypingTime: newTotalTypingTime,
        wordsPerMinute: newWordsPerMinute,
      };

      // Check for suspicious patterns - adjust threshold for WPM
      // Average typing speed is 40 WPM, professional typists might hit 80-100 WPM
      // Anything above 120 might be suspicious
      if (newMetrics.wordsPerMinute > 120) {
        setSuspiciousActivity(true);
      }

      return newMetrics;
    });
  };

  const preventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    setSuspiciousActivity(true);
    console.log("Copy/paste attempt detected - marked as suspicious activity");
  };

  const getAssessmentMetrics = () => {
    const metrics = {
      keystrokes: typingMetrics.keystrokes,
      pauses: typingMetrics.pauses,
      wordsPerMinute: typingMetrics.wordsPerMinute,
      tabSwitches,
      suspiciousActivity,
    };
    
    console.log("Current anti-cheating metrics:", metrics);
    
    return metrics;
  };

  return {
    handleKeyPress,
    preventCopyPaste,
    getAssessmentMetrics,
    tabSwitches,
    suspiciousActivity,
  };
};
