
import { useState, useEffect, useRef } from "react";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

interface TypingMetrics {
  keystrokes: number;
  pauses: number;
  wordsPerMinute: number;
  lastKeystrokeTime: number;
  totalTypingTime: number;
  typingPattern: number[];
}

/**
 * Hook for monitoring assessment integrity and detecting potential cheating attempts
 */
export const useAntiCheating = (response: string) => {
  const [typingMetrics, setTypingMetrics] = useState<TypingMetrics>({
    keystrokes: 0,
    pauses: 0,
    wordsPerMinute: 0,
    lastKeystrokeTime: Date.now(),
    totalTypingTime: 0,
    typingPattern: [],
  });

  const [tabSwitches, setTabSwitches] = useState(0);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const [windowFocuses, setWindowFocuses] = useState(0);
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  const [suspiciousActivityDetail, setSuspiciousActivityDetail] = useState<string | null>(null);
  const [rightClickAttempts, setRightClickAttempts] = useState(0);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(0);

  // Track time spent on prompt
  const promptStartRef = useRef<number>(Date.now());
  const [timeSpentMs, setTimeSpentMs] = useState(0);
  const [suspiciousPatterns, setSuspiciousPatterns] = useState(0);

  // Save simple browser/system info for context
  const userAgent = navigator?.userAgent || "unknown";
  
  // Store typing intervals for rhythm analysis
  const keystrokeTimesRef = useRef<number[]>([]);
  
  // Reference to store the initial content for plagiarism detection
  const initialContentRef = useRef<string>(response);

  useEffect(() => {
    initialContentRef.current = response;
  }, [response]);

  // Track tab switches, focus/blur events, and time spent
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        setWindowBlurs(prev => prev + 1);
        setTimeSpentMs(Date.now() - promptStartRef.current);
        
        if (tabSwitches >= 3) {
          setSuspiciousActivity(true);
          setSuspiciousActivityDetail(`Frequent tab switching detected (${tabSwitches + 1} times). This may indicate looking up answers.`);
        }
        console.log("Tab switch/blur detected - tabSwitches:", tabSwitches + 1, "windowBlurs:", windowBlurs + 1);
      } else {
        setWindowFocuses(prev => prev + 1);
        promptStartRef.current = Date.now();
        console.log("Window focus detected - focus count:", windowFocuses + 1);
      }
    };

    // Monitor keyboard shortcuts that might be used for cheating
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect common copy/paste shortcuts
      if ((e.ctrlKey || e.metaKey) && 
          (e.key === 'c' || e.key === 'v' || e.key === 'x' || 
           e.key === 'a' || e.key === 'f' || e.key === 'g')) {
        setKeyboardShortcuts(prev => prev + 1);
        e.preventDefault();
        
        // Update suspicious activity if multiple shortcuts are used
        if (keyboardShortcuts >= 2) {
          setSuspiciousActivity(true);
          setSuspiciousActivityDetail(`Keyboard shortcuts detected (${keyboardShortcuts + 1} times). This may indicate attempts to copy/paste content.`);
        }
      }
    };
    
    // Prevent right-click menu which can be used for inspect element or copying
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setRightClickAttempts(prev => prev + 1);
      if (rightClickAttempts >= 2) {
        setSuspiciousActivity(true);
        setSuspiciousActivityDetail(`Multiple right-click attempts detected (${rightClickAttempts + 1} times).`);
      }
      return false;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
    // eslint-disable-next-line
  }, [tabSwitches, windowBlurs, windowFocuses, rightClickAttempts, keyboardShortcuts]);

  /**
   * Analyzes typing patterns to detect unnatural typing rhythms 
   * that might indicate copy-pasting or AI generation
   */
  const analyzeTypingPatterns = () => {
    if (keystrokeTimesRef.current.length < 10) return;
    
    const intervals: number[] = [];
    for (let i = 1; i < keystrokeTimesRef.current.length; i++) {
      intervals.push(keystrokeTimesRef.current[i] - keystrokeTimesRef.current[i-1]);
    }
    
    // Check for unnaturally consistent typing (potential AI generation)
    let consistentIntervals = 0;
    for (let i = 1; i < intervals.length; i++) {
      // If typing rhythm is too consistent between keystrokes (within 20ms)
      if (Math.abs(intervals[i] - intervals[i-1]) < 20) {
        consistentIntervals++;
      }
    }
    
    // If more than 40% of the typing rhythm is suspiciously consistent
    if (consistentIntervals > intervals.length * 0.4) {
      setSuspiciousPatterns(prev => prev + 1);
      if (suspiciousPatterns > 0) {
        setSuspiciousActivity(true);
        setSuspiciousActivityDetail("Unusually consistent typing rhythm detected. This may indicate automated text entry.");
      }
    }
    
    // Check for sudden bursts of text (potential copy-paste)
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const longPauses = intervals.filter(interval => interval > avgInterval * 5).length;
    
    if (longPauses > intervals.length * 0.2) {
      setSuspiciousPatterns(prev => prev + 1);
      if (suspiciousPatterns > 0) {
        setSuspiciousActivity(true);
        setSuspiciousActivityDetail("Unusual pattern of text entry detected - periods of inactivity followed by bursts of text.");
      }
    }
  };
  
  /**
   * Updates typing metrics when a key is pressed
   */
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
      const newWordsPerMinute = calculateWordsPerMinute(newKeystrokes, newTotalTypingTime);

      // Add interval to pattern analysis
      const newPattern = [...prev.typingPattern];
      if (timeSinceLastKeystroke > 0) {
        newPattern.push(timeSinceLastKeystroke);
        if (newPattern.length > 50) newPattern.shift(); // Keep last 50 intervals
      }

      checkForSuspiciousTypingSpeed(newWordsPerMinute);
      
      // Every 20 keystrokes, analyze typing patterns
      if (newKeystrokes % 20 === 0) {
        analyzeTypingPatterns();
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
    setRightClickAttempts(0);
    setKeyboardShortcuts(0);
    keystrokeTimesRef.current = [];
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
    rightClickAttempts: number; 
    keyboardShortcuts: number;
    userAgent: string;
  } => {
    const metrics: AntiCheatingMetrics & {
      suspiciousActivityDetail?: string;
      timeSpentMs: number;
      windowBlurs: number;
      windowFocuses: number;
      copyAttempts: number;
      pasteAttempts: number;
      rightClickAttempts: number;
      keyboardShortcuts: number;
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
      rightClickAttempts,
      keyboardShortcuts,
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
