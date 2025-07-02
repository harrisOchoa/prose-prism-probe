import { useRef, useMemo, useCallback } from "react";
import { useKeyboardMetrics } from "./assessment/metrics/useKeyboardMetrics";
import { useWindowEvents } from "./assessment/metrics/useWindowEvents";
import { usePreventActions } from "./assessment/metrics/usePreventActions";
import { useSuspiciousActivity } from "./assessment/metrics/useSuspiciousActivity";
import { useAntiCheatingEffects } from "./assessment/metrics/useAntiCheatingEffects";
import { logger } from "@/services/logging";

/**
 * Optimized anti-cheating hook with performance improvements and proper logging
 */
export const useOptimizedAntiCheating = (response: string) => {
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

  // Memoized metrics function with logging
  const getAssessmentMetrics = useCallback(() => {
    const typingMetrics = getTypingMetrics();
    const windowMetrics = getWindowMetrics();
    const preventionMetrics = getPreventionMetrics();

    const metrics = {
      ...typingMetrics,
      ...windowMetrics,
      ...preventionMetrics,
      suspiciousActivity: suspiciousActivity || suspiciousFocusLoss,
      suspiciousActivityDetail,
      userAgent,
    };

    logger.debug('ANTI_CHEATING', 'Metrics calculated', {
      hasActivity: !!metrics.suspiciousActivity,
      tabSwitches: metrics.tabSwitches,
      keystrokes: metrics.keystrokes
    });

    return metrics;
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