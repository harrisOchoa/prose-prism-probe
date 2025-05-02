
import React from "react";
import AssessmentComplete from "@/components/AssessmentComplete";
import { WritingPromptItem, Stage } from "@/components/AssessmentManager";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

interface CompleteStageProps {
  candidateName: string;
  candidatePosition: string;
  prompts: WritingPromptItem[];
  aptitudeScore: number;
  aptitudeTotal: number;
  antiCheatingMetrics?: AntiCheatingMetrics;
  handleStageTransition: (newStage: Stage) => void;
  restartAssessment: () => void;
}

const CompleteStage: React.FC<CompleteStageProps> = ({ 
  candidateName,
  candidatePosition,
  prompts,
  aptitudeScore,
  aptitudeTotal,
  antiCheatingMetrics,
  handleStageTransition,
  restartAssessment
}) => {
  const onRestart = () => {
    handleStageTransition(Stage.LANDING);
    restartAssessment();
  };
  
  const wordCount = prompts.reduce((total, prompt) => total + prompt.wordCount, 0);

  return (
    <AssessmentComplete
      wordCount={wordCount}
      candidateName={candidateName}
      candidatePosition={candidatePosition}
      restartAssessment={onRestart}
      completedPrompts={prompts}
      aptitudeScore={aptitudeScore}
      aptitudeTotal={aptitudeTotal}
      antiCheatingMetrics={antiCheatingMetrics}
    />
  );
};

export default CompleteStage;
