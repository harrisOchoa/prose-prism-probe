
import React from "react";
import AssessmentIntro from "@/components/AssessmentIntro";
import { Stage } from "@/components/AssessmentManager";

interface InfoStageProps {
  candidateName: string;
  candidatePosition: string;
  handleStageTransition: (newStage: Stage) => void;
  handleInfoSubmit: (name: string, position: string, skills: string) => void;
}

const InfoStage: React.FC<InfoStageProps> = ({ 
  candidateName, 
  candidatePosition,
  handleStageTransition,
  handleInfoSubmit
}) => {
  const onInfoSubmit = (name: string, position: string, skills: string) => {
    handleStageTransition(Stage.GENERATING_PROMPTS);
    handleInfoSubmit(name, position, skills);
  };

  return (
    <AssessmentIntro 
      step="info" 
      candidateName={candidateName}
      candidatePosition={candidatePosition}
      onInfoSubmit={onInfoSubmit} 
    />
  );
};

export default InfoStage;
