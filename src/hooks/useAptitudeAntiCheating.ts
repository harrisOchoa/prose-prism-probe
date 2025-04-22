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
  fullscreenExits: number;
  focusLossDuration: number;
  mouseLeavePage: number;
  browserResizes: number;
  screenResolution: string;
  multipleDisplays: boolean;
  lastActiveTime: number;
  inactivityPeriods: number[];
  totalInactivityTime: number;
  lastInactiveAt: number | null;
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
  
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [mouseLeavePage, setMouseLeavePage] = useState(0);
  const [browserResizes, setBrowserResizes] = useState(0);
  const [inactivityPeriods, setInactivityPeriods] = useState<number[]>([]);
  const [totalInactivityTime, setTotalInactivityTime] = useState(0);
  const [lastInactiveAt, setLastInactiveAt] = useState<number | null>(null);
  const lastActivityTime = useRef(Date.now());
  const inactivityThreshold = 30000; // 30 seconds

  // Detect multiple displays
  const [multipleDisplays, setMultipleDisplays] = useState(false);
  const [screenResolution, setScreenResolution] = useState("");

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Record blur start time
        blurStartTimeRef.current = Date.now();
        setTabSwitches((prev) => prev + 1);
        setWindowBlurs((prev) => prev + 1);
        setTimeSpentMs(Date.now() - promptStartRef.current);
        setWindowBlurCount(prev => prev + 1);
        setLastInactiveAt(Date.now());
        
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

    // Monitor screen changes and multiple displays
    const handleScreenChange = () => {
      if (window.screen && window.screen.availWidth) {
        setScreenResolution(`${window.screen.availWidth}x${window.screen.availHeight}`);
        
        // Attempt to detect multiple displays through screen properties
        if (window.screen.availWidth > window.innerWidth + 100) {
          setMultipleDisplays(true);
          setSuspiciousActivity(true);
          setSuspiciousActivityDetail("Potential multiple display setup detected");
        }
      }
      setBrowserResizes(prev => prev + 1);
    };

    // Monitor fullscreen changes
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenExits(prev => prev + 1);
        setSuspiciousActivity(true);
        setSuspiciousActivityDetail("Assessment environment compromised: Fullscreen mode exited");
      }
    };

    // Monitor mouse leaving the page
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.clientY >= window.innerHeight || 
          e.clientX <= 0 || e.clientX >= window.innerWidth) {
        setMouseLeavePage(prev => prev + 1);
        
        if (mouseLeavePage >= 3) {
          setSuspiciousActivity(true);
          setSuspiciousActivityDetail("Frequent cursor movements outside assessment window detected");
        }
      }
    };

    // Monitor user activity
    const handleActivity = () => {
      const currentTime = Date.now();
      if (currentTime - lastActivityTime.current > inactivityThreshold) {
        setInactivityPeriods(prev => [...prev, currentTime - lastActivityTime.current]);
      }
      lastActivityTime.current = currentTime;
    };

    // Enhanced window blur monitoring
    const handleVisibilityChangeEnhanced = () => {
      if (document.hidden) {
        blurStartTimeRef.current = Date.now();
        setWindowBlurCount(prev => prev + 1);
        
        // Flag suspicious activity for extended focus loss
        if (windowBlurDuration > 10000) { // 10 seconds threshold
          setSuspiciousActivity(true);
          setSuspiciousActivityDetail(`Extended period of inactivity detected: ${Math.round(windowBlurDuration/1000)}s`);
        }
      } else {
        if (blurStartTimeRef.current) {
          const blurDuration = Date.now() - blurStartTimeRef.current;
          setWindowBlurDuration(prev => prev + blurDuration);
          blurStartTimeRef.current = null;
        }
      }
    };

    // Initialize screen monitoring
    handleScreenChange();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    
    // Set up event listeners
    window.addEventListener('resize', handleScreenChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChangeEnhanced);
    ['mousemove', 'keydown', 'click'].forEach(event => 
      document.addEventListener(event, handleActivity)
    );

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      
      window.removeEventListener('resize', handleScreenChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChangeEnhanced);
      ['mousemove', 'keydown', 'click'].forEach(event => 
        document.removeEventListener(event, handleActivity)
      );
    };
  }, [tabSwitches, rightClickAttempts, keyboardShortcuts, windowBlurCount, mouseLeavePage, windowBlurDuration]);

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

  useEffect(() => {
    // Monitor browser activity
    if (windowBlurs >= 3 || totalInactivityTime > 30000) { // More than 3 switches or 30 seconds inactive
      setSuspiciousActivity(true);
      setSuspiciousActivityDetail(
        `Multiple browser switches detected (${windowBlurs} times) with ` +
        `${Math.round(totalInactivityTime / 1000)}s total inactivity time. ` +
        `Last inactive at: ${lastInactiveAt ? new Date(lastInactiveAt).toLocaleTimeString() : 'N/A'}`
      );
    }
  }, [windowBlurs, totalInactivityTime, lastInactiveAt]);

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
    fullscreenExits,
    focusLossDuration: windowBlurDuration,
    mouseLeavePage,
    browserResizes,
    screenResolution,
    multipleDisplays,
    lastActiveTime: lastActivityTime.current,
    inactivityPeriods,
    totalInactivityTime,
    lastInactiveAt,
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
