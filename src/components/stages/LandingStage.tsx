
import React, { useEffect } from "react";
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
  useEffect(() => {
    console.log("LandingStage mounted and rendering");
  }, []);
  
  const handleStart = () => {
    console.log("LandingStage: Start button clicked");
    startAssessment(); // First call startAssessment to initialize
    handleStageTransition(Stage.INFO); // Then transition to the INFO stage
  };

  return (
    <div className="w-full h-full flex-1" data-testid="landing-stage" style={{ display: 'flex', flexDirection: 'column' }}>
      <LandingPage onStart={handleStart} />
    </div>
  );
};

export default LandingStage;
