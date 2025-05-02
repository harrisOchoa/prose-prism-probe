
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Stage } from "@/components/AssessmentManager";
import StepTransition from "@/components/assessment/StepTransition";

interface StageTransitionerProps {
  children: React.ReactNode;
}

const StageTransitioner: React.FC<StageTransitionerProps> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const handleStageTransition = (newStage: Stage) => {
    console.log("Transitioning to stage:", newStage);
    setIsTransitioning(true);
    let message = "";
    let stageParam = "";
    
    switch (newStage) {
      case Stage.APTITUDE:
        message = "Preparing aptitude test...";
        stageParam = "aptitude";
        break;
      case Stage.SELECT_PROMPTS:
        message = "Loading writing prompt options...";
        stageParam = "select_prompts";
        break;
      case Stage.WRITING:
        message = "Setting up writing assessment...";
        stageParam = "writing";
        break;
      case Stage.COMPLETE:
        message = "Finalizing your assessment...";
        stageParam = "complete";
        break;
      case Stage.INFO:
        message = "Loading candidate information...";
        stageParam = "info";
        break;
      case Stage.LANDING:
        message = "Returning to home page...";
        stageParam = "";
        break;
      default:
        message = "Loading next section...";
        stageParam = "";
    }
    
    // Update URL parameter for stage
    setSearchParams(params => {
      if (stageParam) {
        params.set('stage', stageParam);
      } else {
        params.delete('stage');
      }
      return params;
    });
    
    setTransitionMessage(message);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  return (
    <>
      <StepTransition loading={isTransitioning} message={transitionMessage} />
      {React.isValidElement(children) && 
        React.cloneElement(children as React.ReactElement<any>, { 
          handleStageTransition,
          key: searchParams.toString() // Add key to force re-render when URL params change
        })}
    </>
  );
};

export default StageTransitioner;
