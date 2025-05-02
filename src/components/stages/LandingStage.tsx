
import React from "react";
import LandingPage from "@/components/LandingPage";
import { Stage } from "@/components/AssessmentManager";

interface LandingStageProps {
  onStartAssessment?: () => void;
  handleStageTransition: (newStage: Stage) => void;
  startAssessment: () => void;
}

const LandingStage: React.FC<LandingStageProps> = ({ 
  handleStageTransition, 
  startAssessment 
}) => {
  const handleStart = () => {
    startAssessment(); // First call startAssessment to initialize
    handleStageTransition(Stage.INFO); // Then transition to the INFO stage
  };

  return (
    <div className="w-full h-full flex-1">
      <LandingPage onStart={handleStart} />
    </div>
  );
};

export default LandingStage;
