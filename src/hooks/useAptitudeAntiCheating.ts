
import { useEffect, useRef, useState } from "react";

export interface AptitudeAntiCheatingMetrics {
  tabSwitches: number;
  windowBlurs: number;
  windowFocuses: number;
  copyAttempts: number;
  suspiciousActivity: boolean;
  suspiciousActivityDetail?: string;
  timeSpentMs: number;
  userAgent: string;
}

const useAptitudeAntiCheating = () => {
  const [tabSwitches, setTabSwitches] = useState(0);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const [windowFocuses, setWindowFocuses] = useState(0);
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  const [suspiciousActivityDetail, setSuspiciousActivityDetail] = useState<string | null>(null);

  const promptStartRef = useRef<number>(Date.now());
  const [timeSpentMs, setTimeSpentMs] = useState(0);

  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
        setWindowBlurs((prev) => prev + 1);
        setTimeSpentMs(Date.now() - promptStartRef.current);
      } else {
        setWindowFocuses((prev) => prev + 1);
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

  // For copying prevention, handler needs to be exposed
  const preventCopy = (e: React.ClipboardEvent | Event) => {
    e.preventDefault();
    setCopyAttempts((prev) => prev + 1);
    setSuspiciousActivity(true);
    setSuspiciousActivityDetail(`Copy attempt detected at ${new Date().toLocaleTimeString()}.`);
  };

  const getAptitudeAntiCheatingMetrics = (): AptitudeAntiCheatingMetrics => ({
    tabSwitches,
    windowBlurs,
    windowFocuses,
    copyAttempts,
    suspiciousActivity,
    suspiciousActivityDetail: suspiciousActivityDetail ?? undefined,
    timeSpentMs: Date.now() - promptStartRef.current + timeSpentMs,
    userAgent,
  });

  // Allow parent to reset if needed
  const resetMetrics = () => {
    setTabSwitches(0);
    setWindowBlurs(0);
    setWindowFocuses(0);
    setCopyAttempts(0);
    setSuspiciousActivity(false);
    setSuspiciousActivityDetail(null);
    promptStartRef.current = Date.now();
    setTimeSpentMs(0);
  };

  return {
    preventCopy,
    getAptitudeAntiCheatingMetrics,
    tabSwitches,
    suspiciousActivity,
    copyAttempts,
    resetMetrics,
  };
};

export default useAptitudeAntiCheating;

