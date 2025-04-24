
import React from "react";
import { useStageManagement } from "@/hooks/assessment/useStageManagement";
import { useAssessmentState } from "@/hooks/assessment/useAssessmentState";
import { Stage } from "@/types/assessment";

// Re-export items for backward compatibility
export { pathToStage, stageToPath } from "@/hooks/assessment/useStageManagement";
export { Stage } from "@/types/assessment";
export type { WritingPromptItem } from "@/hooks/assessment/useAssessmentState";

interface AssessmentManagerProps {
  children: (props: {
    stage: Stage;
    candidateName: string;
    candidatePosition: string;
    candidateSkills: string;
    currentPromptIndex: number;
    prompts: any[];
    availablePrompts: any[];
    selectedPromptIds: number[];
    aptitudeQuestions: any[];
    aptitudeScore: number;
    antiCheatingMetrics?: any;
    startAssessment: () => void;
    handleInfoSubmit: (name: string, position: string, skills: string) => void;
    handleStart: () => void;
    handleAptitudeComplete: (answers: number[], score: number, metrics?: any) => void;
    handlePromptSubmit: (text: string, metrics?: any) => void;
    handlePromptSelection: (selectedIds: number[]) => void;
    restartAssessment: () => void;
    setStage: (stage: Stage) => void;
  }) => React.ReactNode;
}

const AssessmentManager = ({ children }: AssessmentManagerProps) => {
  const { stage, setStage } = useStageManagement();
  const assessmentState = useAssessmentState(setStage);

  return <>{children({
    stage,
    setStage,
    ...assessmentState
  })}</>;
};

export default AssessmentManager;
