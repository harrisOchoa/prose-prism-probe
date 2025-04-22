
import { MutableRefObject } from "react";

export interface UseAntiCheatingEffectsProps {
  response: string;
  handleKeyboardShortcuts: (e: KeyboardEvent) => void;
  handleContextMenu: (e: MouseEvent) => void;
  getTypingMetrics: () => {
    wordsPerMinute: number;
    [key: string]: any;
  };
  flagSuspiciousActivity: (detail: string) => void;
  tabSwitches: number;
  initialContentRef: MutableRefObject<string>;
}
