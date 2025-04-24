
import React from "react";
import PromptSelection from "@/components/PromptSelection";

interface PromptSelectorProps {
  availablePrompts: any[];
  onSelection: (selectedIds: number[]) => void;
}

const PromptSelector: React.FC<PromptSelectorProps> = ({ availablePrompts, onSelection }) => {
  return (
    <PromptSelection
      availablePrompts={availablePrompts}
      onSelection={onSelection}
      minSelect={1}
      maxSelect={availablePrompts.length}
    />
  );
};

export default PromptSelector;
