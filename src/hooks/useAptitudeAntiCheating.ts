
import { useRef } from "react";
import { useWindowEvents } from "./assessment/metrics/useWindowEvents";
import { usePreventBehavior } from "./assessment/metrics/usePreventBehavior";
import { useScreenMetrics } from "./assessment/metrics/useScreenMetrics";
import { useSuspiciousActivity } from "./assessment/metrics/useSuspiciousActivity";

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

const useAptitudeAntiCheating = () => {
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";

  const {
    getWindowMetrics,
  } = useWindowEvents();

  const {
    preventCopy,
    preventPaste,
    copyAttempts,
    pasteAttempts,
    rightClickAttempts,
    keyboardShortcuts,
    screenshotAttempts,
  } = usePreventBehavior();

  const {
    screenResolution,
    multipleDisplays,
    browserResizes,
    fullscreenExits,
  } = useScreenMetrics();

  const {
    suspiciousActivity,
    suspiciousActivityDetail,
  } = useSuspiciousActivity();

  const lastActivityTime = useRef(Date.now());

  const getAptitudeAntiCheatingMetrics = (): AptitudeAntiCheatingMetrics => {
    const windowMetrics = getWindowMetrics();
    
    return {
      ...windowMetrics,
      copyAttempts,
      pasteAttempts,
      rightClickAttempts,
      keyboardShortcuts,
      suspiciousActivity,
      suspiciousActivityDetail,
      userAgent,
      fullscreenExits,
      focusLossDuration: windowMetrics.totalInactivityTime,
      mouseLeavePage: 0, // This is tracked in useWindowEvents
      browserResizes,
      screenResolution,
      multipleDisplays,
      lastActiveTime: lastActivityTime.current,
      // Adding the missing properties
      windowBlurDuration: windowMetrics.totalInactivityTime, // Use inactivity time as blur duration
      windowBlurCount: windowMetrics.windowBlurs, // Use window blurs as window blur count
    };
  };

  return {
    preventCopy,
    preventPaste,
    getAptitudeAntiCheatingMetrics,
    tabSwitches: getWindowMetrics().tabSwitches,
    suspiciousActivity,
    copyAttempts,
  };
};

export default useAptitudeAntiCheating;
