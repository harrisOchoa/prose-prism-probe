
import { useState } from "react";
import { useSuspiciousActivity } from "./useSuspiciousActivity";

export const usePreventBehavior = () => {
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [rightClickAttempts, setRightClickAttempts] = useState(0);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(0);
  const [screenshotAttempts, setScreenshotAttempts] = useState(0);
  const { flagSuspiciousActivity } = useSuspiciousActivity();

  const handleKeyboardShortcuts = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && 
        (e.key === 'c' || e.key === 'v' || e.key === 'x' || 
         e.key === 'a' || e.key === 'f' || e.key === 'g')) {
      setKeyboardShortcuts(prev => prev + 1);
      e.preventDefault();
      
      if (keyboardShortcuts >= 1) {
        flagSuspiciousActivity(`Keyboard shortcuts detected (${keyboardShortcuts + 1} times) during aptitude test.`);
      }
    }
    
    if ((e.ctrlKey && e.key === 'PrintScreen') || 
        (e.metaKey && (e.shiftKey && e.key === '3' || e.key === '4'))) {
      setScreenshotAttempts(prev => prev + 1);
      flagSuspiciousActivity(`Potential screenshot attempt detected at ${new Date().toLocaleTimeString()}.`);
      e.preventDefault();
    }
  };

  const preventCopy = (e: React.ClipboardEvent | Event) => {
    e.preventDefault();
    setCopyAttempts(prev => prev + 1);
    flagSuspiciousActivity(`Copy attempt detected at ${new Date().toLocaleTimeString()}.`);
  };

  const preventPaste = (e: React.ClipboardEvent | Event) => {
    e.preventDefault();
    setPasteAttempts(prev => prev + 1);
    flagSuspiciousActivity(`Paste attempt detected at ${new Date().toLocaleTimeString()}.`);
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setRightClickAttempts(prev => prev + 1);
    if (rightClickAttempts >= 1) {
      flagSuspiciousActivity(`Right-click menu attempt detected (${rightClickAttempts + 1} times) during aptitude test.`);
    }
    return false;
  };

  return {
    copyAttempts,
    pasteAttempts,
    rightClickAttempts,
    keyboardShortcuts,
    screenshotAttempts,
    handleKeyboardShortcuts,
    preventCopy,
    preventPaste,
    handleContextMenu,
  };
};
