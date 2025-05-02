
import React from "react";
import LandingPage from "@/components/LandingPage";
import { Stage } from "@/components/AssessmentManager";

interface LandingStageProps {
  onStartAssessment: () => void;
  handleStageTransition: (newStage: Stage) => void;
  startAssessment: () => void;
}

const LandingStage: React.FC<LandingStageProps> = ({ 
  handleStageTransition, 
  startAssessment 
}) => {
  const handleStart = () => {
    handleStageTransition(Stage.INFO);
    startAssessment();
  };

  return (
    <LandingPage onStart={handleStart} />
  );
};

export default LandingStage;
