
import { useRef } from "react";
import { useKeyboardMetrics } from "./useKeyboardMetrics";
import { useWindowEvents } from "./useWindowEvents";
import { usePreventActions } from "./usePreventActions";
import { useSuspiciousActivity } from "./useSuspiciousActivity";
import { useAntiCheatingEffects } from "./useAntiCheatingEffects";

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
    tabSwitches
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

  const getAssessmentMetrics = () => {
    const typingMetrics = getTypingMetrics();
    const windowMetrics = getWindowMetrics();
    const preventionMetrics = getPreventionMetrics();

    return {
      ...typingMetrics,
      ...windowMetrics,
      ...preventionMetrics,
      suspiciousActivity,
      suspiciousActivityDetail,
      userAgent,
    };
  };

  return {
    handleKeyPress,
    preventCopyPaste,
    getAssessmentMetrics,
    tabSwitches,
    suspiciousActivity,
    suspiciousActivityDetail,
  };
};
