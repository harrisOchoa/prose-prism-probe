
import { useState, useEffect, useRef } from "react";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

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
    lastKeystrokeTime: Date.now(),
    totalTypingTime: 0,
  });

  const [tabSwitches, setTabSwitches] = useState(0);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const [windowFocuses, setWindowFocuses] = useState(0);
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  const [suspiciousActivityDetail, setSuspiciousActivityDetail] = useState<string | null>(null);

  // Track time spent on prompt
  const promptStartRef = useRef<number>(Date.now());
  const [timeSpentMs, setTimeSpentMs] = useState(0);

  // Save simple browser/system info for context
  const userAgent = navigator?.userAgent || "unknown";

  // Track tab switches, focus/blur events, and time spent
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        setWindowBlurs(prev => prev + 1);
        setTimeSpentMs(Date.now() - promptStartRef.current);
        console.log("Tab switch/blur detected - tabSwitches:", tabSwitches + 1, "windowBlurs:", windowBlurs + 1);
      } else {
        setWindowFocuses(prev => prev + 1);
        promptStartRef.current = Date.now();
        console.log("Window focus detected - focus count:", windowFocuses + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
    // track by reference values not needed; handled via closure
    // eslint-disable-next-line
  }, []);

  /**
   * Updates typing metrics when a key is pressed
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    const currentTime = Date.now();
    setTypingMetrics(prev => {
      const timeSinceLastKeystroke = prev.lastKeystrokeTime > 0
        ? currentTime - prev.lastKeystrokeTime
        : 0;
      const newPauses = timeSinceLastKeystroke > 2000 ? prev.pauses + 1 : prev.pauses;
      const newKeystrokes = prev.keystrokes + 1;
      const newTotalTypingTime = prev.totalTypingTime + timeSinceLastKeystroke;
      const newWordsPerMinute = calculateWordsPerMinute(newKeystrokes, newTotalTypingTime);

      checkForSuspiciousTypingSpeed(newWordsPerMinute);

      return {
        keystrokes: newKeystrokes,
        pauses: newPauses,
        lastKeystrokeTime: currentTime,
        totalTypingTime: newTotalTypingTime,
        wordsPerMinute: newWordsPerMinute,
      };
    });
  };

  /**
   * Calculates words per minute from keystrokes and typing time
   */
  const calculateWordsPerMinute = (keystrokes: number, totalTimeMs: number): number => {
    if (totalTimeMs <= 0) return 0;
    return (keystrokes / 5) / (totalTimeMs / 60000);
  };

  /**
   * Checks if typing speed is suspiciously fast
   */
  const checkForSuspiciousTypingSpeed = (wpm: number) => {
    if (wpm > 120) {
      setSuspiciousActivity(true);
      setSuspiciousActivityDetail(`Unusually fast typing speed detected (${wpm.toFixed(0)} WPM). The average professional typing speed is 65-80 WPM.`);
      console.log("Suspicious typing speed detected:", wpm, "WPM");
    }
  };

  /**
   * Prevents copy/paste actions and logs attempts
   */
  const preventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (e.type === 'copy') {
      setCopyAttempts(prev => prev + 1);
      setSuspiciousActivity(true);
      setSuspiciousActivityDetail(`Copy attempt detected at ${new Date().toLocaleTimeString()}.`);
    } else if (e.type === 'paste') {
      setPasteAttempts(prev => prev + 1);
      setSuspiciousActivity(true);
      setSuspiciousActivityDetail(`Paste attempt detected at ${new Date().toLocaleTimeString()}.`);
    }
    console.log("Copy/Paste attempt detected");
  };

  // When prompt changes/restarts, reset timer
  useEffect(() => {
    promptStartRef.current = Date.now();
    setTimeSpentMs(0);
    setTabSwitches(0);
    setWindowBlurs(0);
    setWindowFocuses(0);
    setCopyAttempts(0);
    setPasteAttempts(0);
  }, [response]);

  /**
   * Returns all assessment integrity metrics
   */
  const getAssessmentMetrics = (): AntiCheatingMetrics & {
    suspiciousActivityDetail?: string;
    timeSpentMs: number;
    windowBlurs: number;
    windowFocuses: number;
    copyAttempts: number;
    pasteAttempts: number;
    userAgent: string;
  } => {
    const metrics: AntiCheatingMetrics & {
      suspiciousActivityDetail?: string;
      timeSpentMs: number;
      windowBlurs: number;
      windowFocuses: number;
      copyAttempts: number;
      pasteAttempts: number;
      userAgent: string;
    } = {
      keystrokes: typingMetrics.keystrokes,
      pauses: typingMetrics.pauses,
      wordsPerMinute: typingMetrics.wordsPerMinute,
      tabSwitches,
      suspiciousActivity,
      timeSpentMs: Date.now() - promptStartRef.current + timeSpentMs,
      windowBlurs,
      windowFocuses,
      copyAttempts,
      pasteAttempts,
      userAgent,
    };

    if (suspiciousActivity && suspiciousActivityDetail) {
      metrics.suspiciousActivityDetail = suspiciousActivityDetail;
    }
    console.log("Anti-cheating metrics snapshot:", metrics);
    return metrics;
  };

  return {
    handleKeyPress,
    preventCopyPaste,
    getAssessmentMetrics,
    tabSwitches,
    suspiciousActivity,
    suspiciousActivityDetail,
    windowBlurs,
    windowFocuses,
    copyAttempts,
    pasteAttempts,
    timeSpentMs,
    userAgent
  };
};
