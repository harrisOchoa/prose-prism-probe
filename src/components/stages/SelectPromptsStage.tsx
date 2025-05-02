
import React from "react";
import PromptSelection from "@/components/PromptSelection";
import { WritingPromptQuestion } from "@/utils/questionBank";
import { Stage } from "@/components/AssessmentManager";

interface SelectPromptsStageProps {
  availablePrompts: WritingPromptQuestion[];
  handleStageTransition: (newStage: Stage) => void;
  handlePromptSelection: (selectedIds: number[]) => void;
}

const SelectPromptsStage: React.FC<SelectPromptsStageProps> = ({ 
  availablePrompts, 
  handleStageTransition, 
  handlePromptSelection 
}) => {
  const onSelection = (selectedIds: number[]) => {
    handleStageTransition(Stage.WRITING);
    handlePromptSelection(selectedIds);
  };

  return (
    <PromptSelection
      availablePrompts={availablePrompts}
      onSelection={onSelection}
      minSelect={1}
      maxSelect={availablePrompts.length}
    />
  );
};

export default SelectPromptsStage;
