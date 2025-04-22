import { useEffect, useRef, useState } from "react";

export interface AptitudeAntiCheatingMetrics {
  tabSwitches: number;
  windowBlurs: number;
  windowFocuses: number;
  copyAttempts: number;
  pasteAttempts: number;
  rightClickAttempts: number;
  keyboardShortcuts: number;
  suspiciousActivity: boolean;
  suspiciousActivityDetail?: string;
  timeSpentMs: number;
  userAgent: string;
  windowBlurDuration: number;
  windowBlurCount: number;
}

/**
 * Hook for monitoring integrity during aptitude assessments
 */
const useAptitudeAntiCheating = () => {
  const [tabSwitches, setTabSwitches] = useState(0);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const [windowFocuses, setWindowFocuses] = useState(0);
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [rightClickAttempts, setRightClickAttempts] = useState(0);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  const [suspiciousActivityDetail, setSuspiciousActivityDetail] = useState<string | null>(null);

  const promptStartRef = useRef<number>(Date.now());
  const [timeSpentMs, setTimeSpentMs] = useState(0);

  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";

  // Track if we're capturing screenshot attempts (for native screenshot APIs)
  const [screenshotAttempts, setScreenshotAttempts] = useState(0);
  const [windowBlurCount, setWindowBlurCount] = useState(0);
  const [windowBlurDuration, setWindowBlurDuration] = useState(0);
  const blurStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Record blur start time
        blurStartTimeRef.current = Date.now();
        setTabSwitches((prev) => prev + 1);
        setWindowBlurs((prev) => prev + 1);
        setTimeSpentMs(Date.now() - promptStartRef.current);
        setWindowBlurCount(prev => prev + 1);
        
        // Flag as suspicious if tab is switched too many times
        if (tabSwitches >= 2) {
          setSuspiciousActivity(true);
          setSuspiciousActivityDetail(`Frequent tab switching (${tabSwitches + 1} times) detected during aptitude test.`);
        }

        // Flag as suspicious if window is blurred frequently
        if (windowBlurCount >= 2) {
          setSuspiciousActivity(true);
          setSuspiciousActivityDetail(`Frequent window blur detected (${windowBlurCount + 1} times) during aptitude test.`);
        }
      } else {
        // Calculate blur duration when window comes back into focus
        if (blurStartTimeRef.current) {
          const blurDuration = Date.now() - blurStartTimeRef.current;
          setWindowBlurDuration(prev => prev + blurDuration);
          blurStartTimeRef.current = null;
        }
        setWindowFocuses((prev) => prev + 1);
        promptStartRef.current = Date.now();
      }
    };

    // Monitor keyboard shortcuts that might be used for cheating
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect common shortcuts
      if ((e.ctrlKey || e.metaKey) && 
          (e.key === 'c' || e.key === 'v' || e.key === 'x' || 
           e.key === 'a' || e.key === 'f' || e.key === 'g')) {
        setKeyboardShortcuts(prev => prev + 1);
        e.preventDefault();
        
        // Update suspicious activity
        if (keyboardShortcuts >= 1) {
          setSuspiciousActivity(true);
          setSuspiciousActivityDetail(`Keyboard shortcuts detected (${keyboardShortcuts + 1} times) during aptitude test.`);
        }
      }
      
      // Detect screenshot shortcuts
      if ((e.ctrlKey && e.key === 'PrintScreen') || 
          (e.metaKey && (e.shiftKey && e.key === '3' || e.key === '4'))) {
        setScreenshotAttempts(prev => prev + 1);
        setSuspiciousActivity(true);
        setSuspiciousActivityDetail(`Potential screenshot attempt detected at ${new Date().toLocaleTimeString()}.`);
        e.preventDefault();
      }
    };
    
    // Prevent right-click/context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setRightClickAttempts(prev => prev + 1);
      if (rightClickAttempts >= 1) {
        setSuspiciousActivity(true);
        setSuspiciousActivityDetail(`Right-click menu attempt detected (${rightClickAttempts + 1} times) during aptitude test.`);
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
  }, [tabSwitches, rightClickAttempts, keyboardShortcuts, windowBlurCount]);

  // For copying prevention, handler needs to be exposed
  const preventCopy = (e: React.ClipboardEvent | Event) => {
    e.preventDefault();
    setCopyAttempts((prev) => prev + 1);
    setSuspiciousActivity(true);
    setSuspiciousActivityDetail(`Copy attempt detected at ${new Date().toLocaleTimeString()}.`);
  };
  
  // For paste prevention, separate handler
  const preventPaste = (e: React.ClipboardEvent | Event) => {
    e.preventDefault();
    setPasteAttempts((prev) => prev + 1);
    setSuspiciousActivity(true);
    setSuspiciousActivityDetail(`Paste attempt detected at ${new Date().toLocaleTimeString()}.`);
  };

  const getAptitudeAntiCheatingMetrics = (): AptitudeAntiCheatingMetrics => ({
    tabSwitches,
    windowBlurs,
    windowFocuses,
    copyAttempts,
    pasteAttempts,
    rightClickAttempts,
    keyboardShortcuts,
    suspiciousActivity,
    suspiciousActivityDetail: suspiciousActivityDetail ?? undefined,
    timeSpentMs: Date.now() - promptStartRef.current + timeSpentMs,
    userAgent,
    windowBlurDuration,
    windowBlurCount,
  });

  // Allow parent to reset if needed
  const resetMetrics = () => {
    setTabSwitches(0);
    setWindowBlurs(0);
    setWindowFocuses(0);
    setCopyAttempts(0);
    setPasteAttempts(0);
    setRightClickAttempts(0);
    setKeyboardShortcuts(0);
    setSuspiciousActivity(false);
    setSuspiciousActivityDetail(null);
    promptStartRef.current = Date.now();
    setTimeSpentMs(0);
  };

  return {
    preventCopy,
    preventPaste,
    getAptitudeAntiCheatingMetrics,
    tabSwitches,
    suspiciousActivity,
    copyAttempts,
    resetMetrics,
  };
};

export default useAptitudeAntiCheating;
