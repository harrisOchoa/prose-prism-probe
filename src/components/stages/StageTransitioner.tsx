
import React, { useState, useEffect } from "react";
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
  const [key, setKey] = useState(Date.now()); // Add a key to force re-render

  useEffect(() => {
    console.log("StageTransitioner rendering with children:", children ? 'present' : 'absent');
    setKey(Date.now()); // Update key when searchParams change to force re-render
  }, [searchParams, children]);

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

  // Without a valid React Element, return fallback content
  if (!React.isValidElement(children)) {
    console.error("StageTransitioner: Invalid children provided", children);
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded">
        Error loading content. Please refresh the page.
      </div>
    );
  }

  return (
    <React.Fragment key={key}>
      <StepTransition loading={isTransitioning} message={transitionMessage} />
      {React.cloneElement(children as React.ReactElement<any>, { 
        handleStageTransition 
      })}
    </React.Fragment>
  );
};

export default StageTransitioner;
