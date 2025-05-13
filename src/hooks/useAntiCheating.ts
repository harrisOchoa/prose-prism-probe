
import { useRef, useMemo } from "react";
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

  // Memoize the metrics function to prevent unnecessary re-renders
  const getAssessmentMetrics = useMemo(() => {
    return () => {
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
  }, [getTypingMetrics, getWindowMetrics, getPreventionMetrics, suspiciousActivity, suspiciousFocusLoss, suspiciousActivityDetail, userAgent]);

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
