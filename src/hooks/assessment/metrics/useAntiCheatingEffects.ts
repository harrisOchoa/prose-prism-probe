
import { useEffect } from "react";
import { UseAntiCheatingEffectsProps } from "./types";

export const useAntiCheatingEffects = ({
  response,
  handleKeyboardShortcuts,
  handleContextMenu,
  getTypingMetrics,
  flagSuspiciousActivity,
  tabSwitches,
  initialContentRef,
}: UseAntiCheatingEffectsProps) => {
  // Monitor keyboard shortcuts and context menu
  useEffect(() => {
    document.addEventListener("keydown", handleKeyboardShortcuts);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("keydown", handleKeyboardShortcuts);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [handleKeyboardShortcuts, handleContextMenu]);

  // Store initial content for plagiarism detection
  useEffect(() => {
    initialContentRef.current = response;
  }, [response, initialContentRef]);

  // Check for suspicious typing speed
  useEffect(() => {
    const { wordsPerMinute } = getTypingMetrics();
    if (wordsPerMinute > 120) {
      flagSuspiciousActivity(
        `Unusually fast typing speed detected (${wordsPerMinute.toFixed(
          0
        )} WPM). The average professional typing speed is 65-80 WPM.`
      );
    }
  }, [getTypingMetrics, flagSuspiciousActivity]);

  // Check for suspicious tab switching
  useEffect(() => {
    if (tabSwitches >= 3) {
      flagSuspiciousActivity(
        `Frequent tab switching detected (${tabSwitches} times). This may indicate looking up answers.`
      );
    }
  }, [tabSwitches, flagSuspiciousActivity]);
};
