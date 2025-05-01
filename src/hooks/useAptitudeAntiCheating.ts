
import { useRef, useEffect } from "react";
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
  focusLossEvents?: Array<{timestamp: number, duration: number}>;
  longestFocusLossDuration?: number;
  averageFocusLossDuration?: number;
  suspiciousFocusLoss?: boolean;
}

const useAptitudeAntiCheating = () => {
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";

  const {
    getWindowMetrics,
    suspiciousFocusLoss
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
    flagSuspiciousActivity
  } = useSuspiciousActivity();

  const lastActivityTime = useRef(Date.now());

  // Flag suspicious activity if focus loss is detected
  useEffect(() => {
    if (suspiciousFocusLoss && !suspiciousActivity) {
      const { focusLossEvents, longestFocusLossDuration, averageFocusLossDuration } = getWindowMetrics();
      flagSuspiciousActivity(
        `Suspicious window focus patterns detected: ${focusLossEvents.length} focus loss events, ` +
        `longest: ${(longestFocusLossDuration/1000).toFixed(1)}s, ` +
        `average: ${(averageFocusLossDuration/1000).toFixed(1)}s. ` +
        `This may indicate the use of external resources or multiple screens.`
      );
    }
  }, [suspiciousFocusLoss, suspiciousActivity, getWindowMetrics, flagSuspiciousActivity]);

  const getAptitudeAntiCheatingMetrics = (): AptitudeAntiCheatingMetrics => {
    const windowMetrics = getWindowMetrics();
    
    return {
      ...windowMetrics,
      copyAttempts,
      pasteAttempts,
      rightClickAttempts,
      keyboardShortcuts,
      suspiciousActivity: suspiciousActivity || suspiciousFocusLoss,
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
    suspiciousActivity: suspiciousActivity || suspiciousFocusLoss,
    copyAttempts,
  };
};

export default useAptitudeAntiCheating;
