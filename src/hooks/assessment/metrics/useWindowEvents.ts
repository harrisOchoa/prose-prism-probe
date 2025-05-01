
import { useState, useRef, useEffect } from "react";

export interface WindowMetrics {
  tabSwitches: number;
  windowBlurs: number;
  windowFocuses: number;
  timeSpentMs: number;
  inactivityPeriods: number[];
  totalInactivityTime: number;
  lastInactiveAt: number | null;
  focusLossEvents: {
    timestamp: number;
    duration: number;
  }[];
  longestFocusLossDuration: number;
  averageFocusLossDuration: number;
  suspiciousFocusLoss: boolean;
}

export const useWindowEvents = () => {
  const [tabSwitches, setTabSwitches] = useState(0);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const [windowFocuses, setWindowFocuses] = useState(0);
  const [inactivityPeriods, setInactivityPeriods] = useState<number[]>([]);
  const [totalInactivityTime, setTotalInactivityTime] = useState(0);
  const [lastInactiveAt, setLastInactiveAt] = useState<number | null>(null);
  const [focusLossEvents, setFocusLossEvents] = useState<Array<{timestamp: number, duration: number}>>([]);
  const [longestFocusLossDuration, setLongestFocusLossDuration] = useState(0);
  const [averageFocusLossDuration, setAverageFocusLossDuration] = useState(0);
  const [suspiciousFocusLoss, setSuspiciousFocusLoss] = useState(false);
  
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
          
          // Update inactivity periods
          setInactivityPeriods(prev => [...prev, inactivityDuration]);
          setTotalInactivityTime(prev => prev + inactivityDuration);
          
          // Update focus loss events
          const newFocusLossEvent = {
            timestamp: inactivityStartTime.current,
            duration: inactivityDuration
          };
          
          setFocusLossEvents(prev => {
            const updatedEvents = [...prev, newFocusLossEvent];
            
            // Calculate metrics from all focus loss events
            const longestDuration = Math.max(...updatedEvents.map(e => e.duration), 0);
            setLongestFocusLossDuration(longestDuration);
            
            const avgDuration = updatedEvents.reduce((sum, e) => sum + e.duration, 0) / updatedEvents.length;
            setAverageFocusLossDuration(avgDuration);
            
            // Flag suspicious focus loss patterns:
            // 1. Multiple focus loss events (3+)
            // 2. Any single event longer than 20 seconds
            // 3. Average duration more than 10 seconds
            const isSuspicious = 
              updatedEvents.length >= 3 || 
              longestDuration > 20000 || 
              avgDuration > 10000;
            
            setSuspiciousFocusLoss(isSuspicious);
            
            return updatedEvents;
          });
          
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
        
        // Add to inactivity periods
        setInactivityPeriods(prev => [...prev, inactivityDuration]);
        setTotalInactivityTime(prev => prev + inactivityDuration);
        
        // Add focus loss event
        const newFocusLossEvent = {
          timestamp: inactivityStartTime.current,
          duration: inactivityDuration
        };
        
        setFocusLossEvents(prev => {
          const updatedEvents = [...prev, newFocusLossEvent];
          
          // Update metrics
          const longestDuration = Math.max(...updatedEvents.map(e => e.duration), 0);
          setLongestFocusLossDuration(longestDuration);
          
          const avgDuration = updatedEvents.reduce((sum, e) => sum + e.duration, 0) / updatedEvents.length;
          setAverageFocusLossDuration(avgDuration);
          
          // Flag suspicious focus loss
          const isSuspicious = 
            updatedEvents.length >= 3 || 
            longestDuration > 20000 || 
            avgDuration > 10000;
          
          setSuspiciousFocusLoss(isSuspicious);
          
          return updatedEvents;
        });
        
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
    lastInactiveAt,
    focusLossEvents,
    longestFocusLossDuration,
    averageFocusLossDuration,
    suspiciousFocusLoss
  });

  return {
    getWindowMetrics,
    tabSwitches,
    windowBlurs,
    focusLossEvents,
    suspiciousFocusLoss
  };
};
