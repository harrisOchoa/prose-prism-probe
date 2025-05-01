
import { useRef } from "react";
import { useKeyboardMetrics } from "./assessment/metrics/useKeyboardMetrics";
import { useWindowEvents } from "./assessment/metrics/useWindowEvents";
import { usePreventActions } from "./assessment/metrics/usePreventActions";
import { useSuspiciousActivity } from "./assessment/metrics/useSuspiciousActivity";
import { useAntiCheatingEffects } from "./assessment/metrics/useAntiCheatingEffects";

export const useAntiCheating = (response: string) => {
  const userAgent = navigator?.userAgent || "unknown";
  const initialContentRef = useRef<string>(response);

  const {
    handleKeyPress,
    getTypingMetrics,
    keystrokeTimes
  } = useKeyboardMetrics(response);

  const {
    getWindowMetrics,
    tabSwitches,
    windowBlurs,
    suspiciousFocusLoss
  } = useWindowEvents();

  const {
    preventCopyPaste,
    handleKeyboardShortcuts,
    handleContextMenu,
    getPreventionMetrics
  } = usePreventActions();

  const {
    suspiciousActivity,
    suspiciousActivityDetail,
    flagSuspiciousActivity
  } = useSuspiciousActivity();

  // Use the extracted effects
  useAntiCheatingEffects({
    response,
    handleKeyboardShortcuts,
    handleContextMenu,
    getTypingMetrics,
    flagSuspiciousActivity,
    tabSwitches,
    initialContentRef,
  });

  // Flag suspicious activity if focus loss is detected
  if (suspiciousFocusLoss && !suspiciousActivity) {
    const { focusLossEvents, longestFocusLossDuration, averageFocusLossDuration } = getWindowMetrics();
    flagSuspiciousActivity(
      `Suspicious window focus patterns detected: ${focusLossEvents.length} focus loss events, ` +
      `longest: ${(longestFocusLossDuration/1000).toFixed(1)}s, ` +
      `average: ${(averageFocusLossDuration/1000).toFixed(1)}s. ` +
      `This may indicate the use of external resources or multiple screens.`
    );
  }

  const getAssessmentMetrics = () => {
    const typingMetrics = getTypingMetrics();
    const windowMetrics = getWindowMetrics();
    const preventionMetrics = getPreventionMetrics();

    return {
      ...typingMetrics,
      ...windowMetrics,
      ...preventionMetrics,
      suspiciousActivity: suspiciousActivity || suspiciousFocusLoss,
      suspiciousActivityDetail,
      userAgent,
    };
  };

  return {
    handleKeyPress,
    preventCopyPaste,
    getAssessmentMetrics,
    tabSwitches,
    windowBlurs,
    suspiciousActivity: suspiciousActivity || suspiciousFocusLoss,
    suspiciousActivityDetail,
  };
};
