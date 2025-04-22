
import { useEffect, useRef } from "react";
import { useKeyboardMetrics } from "./assessment/metrics/useKeyboardMetrics";
import { useWindowEvents } from "./assessment/metrics/useWindowEvents";
import { usePreventActions } from "./assessment/metrics/usePreventActions";
import { useSuspiciousActivity } from "./assessment/metrics/useSuspiciousActivity";

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

  // Store initial content for plagiarism detection
  useEffect(() => {
    initialContentRef.current = response;
  }, [response]);

  useEffect(() => {
    // Monitor keyboard shortcuts
    document.addEventListener("keydown", handleKeyboardShortcuts);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("keydown", handleKeyboardShortcuts);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [handleKeyboardShortcuts, handleContextMenu]);

  // Check for suspicious typing speed
  useEffect(() => {
    const { wordsPerMinute } = getTypingMetrics();
    if (wordsPerMinute > 120) {
      flagSuspiciousActivity(`Unusually fast typing speed detected (${wordsPerMinute.toFixed(0)} WPM). The average professional typing speed is 65-80 WPM.`);
    }
  }, [getTypingMetrics().wordsPerMinute]);

  // Check for suspicious tab switching
  useEffect(() => {
    if (tabSwitches >= 3) {
      flagSuspiciousActivity(`Frequent tab switching detected (${tabSwitches} times). This may indicate looking up answers.`);
    }
  }, [tabSwitches]);

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
    // We're still returning these values for internal component use,
    // but they shouldn't be displayed to the user during the assessment
    tabSwitches,
    suspiciousActivity,
    suspiciousActivityDetail,
  };
};
