
import { useState } from "react";

export const usePreventActions = () => {
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [rightClickAttempts, setRightClickAttempts] = useState(0);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(0);

  const handleKeyboardShortcuts = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && 
        (e.key === 'c' || e.key === 'v' || e.key === 'x' || 
         e.key === 'a' || e.key === 'f' || e.key === 'g')) {
      setKeyboardShortcuts(prev => prev + 1);
      e.preventDefault();
    }
  };

  const preventCopyPaste = (e: React.ClipboardEvent | Event) => {
    e.preventDefault();
    if (e.type === 'copy') {
      setCopyAttempts(prev => prev + 1);
    } else if (e.type === 'paste') {
      setPasteAttempts(prev => prev + 1);
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setRightClickAttempts(prev => prev + 1);
    return false;
  };

  const getPreventionMetrics = () => ({
    copyAttempts,
    pasteAttempts,
    rightClickAttempts,
    keyboardShortcuts,
  });

  return {
    preventCopyPaste,
    handleKeyboardShortcuts,
    handleContextMenu,
    getPreventionMetrics,
  };
};
