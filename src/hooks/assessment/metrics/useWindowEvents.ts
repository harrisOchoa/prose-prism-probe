
import { useState, useRef, useEffect } from "react";

export const useWindowEvents = () => {
  const [tabSwitches, setTabSwitches] = useState(0);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const [windowFocuses, setWindowFocuses] = useState(0);
  const promptStartRef = useRef<number>(Date.now());
  const [timeSpentMs, setTimeSpentMs] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        setWindowBlurs(prev => prev + 1);
        setTimeSpentMs(Date.now() - promptStartRef.current);
      } else {
        setWindowFocuses(prev => prev + 1);
        promptStartRef.current = Date.now();
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
  }, []);

  const getWindowMetrics = () => ({
    tabSwitches,
    windowBlurs,
    windowFocuses,
    timeSpentMs: Date.now() - promptStartRef.current + timeSpentMs,
  });

  return {
    getWindowMetrics,
    tabSwitches,
  };
};
