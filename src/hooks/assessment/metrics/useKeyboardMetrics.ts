
import { useState, useRef } from "react";

interface TypingMetrics {
  keystrokes: number;
  pauses: number;
  wordsPerMinute: number;
  lastKeystrokeTime: number;
  totalTypingTime: number;
  typingPattern: number[];
}

export const useKeyboardMetrics = (response: string) => {
  const [typingMetrics, setTypingMetrics] = useState<TypingMetrics>({
    keystrokes: 0,
    pauses: 0,
    wordsPerMinute: 0,
    lastKeystrokeTime: Date.now(),
    totalTypingTime: 0,
    typingPattern: [],
  });

  const keystrokeTimesRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  
  // Initialize keystrokes based on response length if available
  useRef<boolean>(false).current || (() => {
    if (response && response.length > 0) {
      setTypingMetrics(prev => ({
        ...prev, 
        keystrokes: Math.max(prev.keystrokes, response.length)
      }));
      return true;
    }
    return false;
  })();

  const calculateWordsPerMinute = (keystrokes: number, totalTimeMs: number): number => {
    // Fix: Return 0 if there's no typing activity or time is zero/negative
    if (totalTimeMs <= 0 || keystrokes <= 0) return 0;
    
    // Standard calculation: 5 keystrokes = 1 word, convert ms to minutes
    const minutes = totalTimeMs / 60000;
    if (minutes < 0.1) return 0; // Avoid division by very small numbers
    
    return Math.min(200, (keystrokes / 5) / minutes);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    const currentTime = Date.now();
    keystrokeTimesRef.current.push(currentTime);
    
    setTypingMetrics(prev => {
      const timeSinceLastKeystroke = prev.lastKeystrokeTime > 0
        ? currentTime - prev.lastKeystrokeTime
        : 0;
      const newPauses = timeSinceLastKeystroke > 2000 ? prev.pauses + 1 : prev.pauses;
      const newKeystrokes = prev.keystrokes + 1;
      const newTotalTypingTime = prev.totalTypingTime + timeSinceLastKeystroke;
      
      // Calculate words per minute based on session time
      const sessionTime = currentTime - startTimeRef.current;
      const newWordsPerMinute = calculateWordsPerMinute(newKeystrokes, sessionTime);

      const newPattern = [...prev.typingPattern];
      if (timeSinceLastKeystroke > 0) {
        newPattern.push(timeSinceLastKeystroke);
        if (newPattern.length > 50) newPattern.shift();
      }

      return {
        keystrokes: newKeystrokes,
        pauses: newPauses,
        lastKeystrokeTime: currentTime,
        totalTypingTime: newTotalTypingTime,
        wordsPerMinute: newWordsPerMinute,
        typingPattern: newPattern,
      };
    });
  };

  const getTypingMetrics = () => {
    // Recalculate WPM before returning to ensure it's current
    const currentTime = Date.now();
    const sessionDuration = currentTime - startTimeRef.current;
    const updatedMetrics = {...typingMetrics};
    
    if (sessionDuration > 5000) { // Only calculate if at least 5 seconds have passed
      updatedMetrics.wordsPerMinute = calculateWordsPerMinute(
        updatedMetrics.keystrokes, 
        sessionDuration
      );
    }
    
    return updatedMetrics;
  };

  return {
    handleKeyPress,
    getTypingMetrics,
    keystrokeTimes: keystrokeTimesRef.current,
  };
};
