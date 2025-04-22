
import { useState, useRef, useEffect } from "react";

export interface WindowMetrics {
  tabSwitches: number;
  windowBlurs: number;
  windowFocuses: number;
  timeSpentMs: number;
  inactivityPeriods: number[];
  totalInactivityTime: number;
  lastInactiveAt: number | null;
}

export const useWindowEvents = () => {
  const [tabSwitches, setTabSwitches] = useState(0);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const [windowFocuses, setWindowFocuses] = useState(0);
  const [inactivityPeriods, setInactivityPeriods] = useState<number[]>([]);
  const [totalInactivityTime, setTotalInactivityTime] = useState(0);
  const [lastInactiveAt, setLastInactiveAt] = useState<number | null>(null);
  
  const promptStartRef = useRef<number>(Date.now());
  const [timeSpentMs, setTimeSpentMs] = useState(0);
  const inactivityStartTime = useRef<number | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      
      if (document.hidden) {
        // User has switched away from the tab/window
        setTabSwitches(prev => prev + 1);
        setWindowBlurs(prev => prev + 1);
        inactivityStartTime.current = now;
        setLastInactiveAt(now);
        
        // Update time spent before going inactive
        setTimeSpentMs(now - promptStartRef.current);
      } else {
        // User has returned to the tab/window
        setWindowFocuses(prev => prev + 1);
        promptStartRef.current = now;
        
        // Calculate inactivity duration if there was an inactivity period
        if (inactivityStartTime.current) {
          const inactivityDuration = now - inactivityStartTime.current;
          setInactivityPeriods(prev => [...prev, inactivityDuration]);
          setTotalInactivityTime(prev => prev + inactivityDuration);
          inactivityStartTime.current = null;
        }
      }
    };

    // Handle page visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Handle window blur/focus events
    window.addEventListener("blur", handleVisibilityChange);
    window.addEventListener("focus", () => {
      const now = Date.now();
      setWindowFocuses(prev => prev + 1);
      
      if (inactivityStartTime.current) {
        const inactivityDuration = now - inactivityStartTime.current;
        setInactivityPeriods(prev => [...prev, inactivityDuration]);
        setTotalInactivityTime(prev => prev + inactivityDuration);
        inactivityStartTime.current = null;
      }
    });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, []);

  const getWindowMetrics = (): WindowMetrics => ({
    tabSwitches,
    windowBlurs,
    windowFocuses,
    timeSpentMs: Date.now() - promptStartRef.current + timeSpentMs,
    inactivityPeriods,
    totalInactivityTime,
    lastInactiveAt
  });

  return {
    getWindowMetrics,
    tabSwitches,
  };
};
