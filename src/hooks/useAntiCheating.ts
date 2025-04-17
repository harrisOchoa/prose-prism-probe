
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
      
      // Calculate typing speed (characters per second)
      const newAverageTypingSpeed = newTotalTypingTime > 0 
        ? newKeystrokes / (newTotalTypingTime / 1000) 
        : 0;
      
      const newMetrics = {
        keystrokes: newKeystrokes,
        pauses: newPauses,
        lastKeystrokeTime: currentTime,
        totalTypingTime: newTotalTypingTime,
        averageTypingSpeed: newAverageTypingSpeed,
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
    setSuspiciousActivity(true);
    console.log("Copy/paste attempt detected - marked as suspicious activity");
  };

  const getAssessmentMetrics = () => {
    const metrics = {
      keystrokes: typingMetrics.keystrokes,
      pauses: typingMetrics.pauses,
      averageTypingSpeed: typingMetrics.averageTypingSpeed,
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
