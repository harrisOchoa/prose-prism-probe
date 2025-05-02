
import React from "react";
import AssessmentIntro from "@/components/AssessmentIntro";
import { Stage } from "@/components/AssessmentManager";

interface IntroStageProps {
  candidateName: string;
  handleStageTransition: (newStage: Stage) => void;
  handleStart: () => void;
}

const IntroStage: React.FC<IntroStageProps> = ({ 
  candidateName,
  handleStageTransition,
  handleStart 
}) => {
  const onStart = () => {
    handleStageTransition(Stage.APTITUDE);
    handleStart();
  };

  return (
    <AssessmentIntro 
      step="instructions" 
      candidateName={candidateName}
      onStart={onStart} 
    />
  );
};

export default IntroStage;
