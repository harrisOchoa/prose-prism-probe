
import React from "react";
import WritingPrompt from "@/components/WritingPrompt";
import { WritingPromptItem, Stage } from "@/components/AssessmentManager";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

interface WritingStageProps {
  prompts: WritingPromptItem[];
  currentPromptIndex: number;
  handleStageTransition: (newStage: Stage) => void;
  handlePromptSubmit: (text: string, metrics?: AntiCheatingMetrics) => void;
}

const WritingStage: React.FC<WritingStageProps> = ({ 
  prompts, 
  currentPromptIndex, 
  handleStageTransition, 
  handlePromptSubmit 
}) => {
  const onSubmit = (text: string, metrics?: AntiCheatingMetrics) => {
    const isLastPrompt = currentPromptIndex === prompts.length - 1;
    if (isLastPrompt) {
      handleStageTransition(Stage.COMPLETE);
    }
    handlePromptSubmit(text, metrics);
  };

  return (
    <WritingPrompt 
      prompt={prompts[currentPromptIndex]?.prompt || ""}
      response={prompts[currentPromptIndex]?.response || ""}
      timeLimit={30 * 60} // 30 minutes in seconds
      onSubmit={onSubmit}
      currentQuestion={currentPromptIndex + 1}
      totalQuestions={prompts.length}
      isLoading={prompts.length === 0}
    />
  );
};

export default WritingStage;
