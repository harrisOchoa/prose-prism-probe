
import React from "react";
import { Stage } from "@/components/AssessmentManager";
import StepTransition from "@/components/assessment/StepTransition";

// Import stage components
import Landing from "./components/Landing";
import Info from "./components/Info";
import Intro from "./components/Intro";
import Aptitude from "./components/Aptitude";
import PromptSelector from "./components/PromptSelector";
import Writing from "./components/Writing";
import Complete from "./components/Complete";

interface AssessmentStagesProps {
  stage: Stage;
  showGlobalDialog: boolean;
  isTransitioning: boolean;
  transitionMessage: string;
  candidateName: string;
  candidatePosition: string;
  currentPromptIndex: number;
  prompts: any[];
  availablePrompts: any[];
  aptitudeQuestions: any[];
  aptitudeScore: number;
  antiCheatingMetrics?: any;
  onStart: () => void;
  onInfoSubmit: (name: string, position: string, skills: string) => void;
  handleStart: () => void;
  handleAptitudeComplete: (answers: number[], score: number, metrics?: any) => void;
  handlePromptSubmit: (text: string, metrics?: any) => void;
  handlePromptSelection: (selectedIds: number[]) => void;
  restartAssessment: () => void;
}

const AssessmentStages: React.FC<AssessmentStagesProps> = ({
  stage,
  showGlobalDialog,
  isTransitioning,
  transitionMessage,
  candidateName,
  candidatePosition,
  currentPromptIndex,
  prompts,
  availablePrompts,
  aptitudeQuestions,
  aptitudeScore,
  antiCheatingMetrics,
  onStart,
  onInfoSubmit,
  handleStart,
  handleAptitudeComplete,
  handlePromptSubmit,
  handlePromptSelection,
  restartAssessment,
}) => {
  return (
    <div className="assessment-container min-h-screen py-6 sm:py-12 px-2 sm:px-0">
      <StepTransition loading={isTransitioning} message={transitionMessage} />

      {stage === Stage.LANDING && !showGlobalDialog && (
        <Landing onStart={onStart} />
      )}

      {stage === Stage.INFO && (
        <Info 
          candidateName={candidateName}
          candidatePosition={candidatePosition}
          onInfoSubmit={onInfoSubmit}
        />
      )}

      {stage === Stage.INTRO && (
        <Intro 
          candidateName={candidateName}
          onStart={handleStart}
        />
      )}

      {stage === Stage.APTITUDE && aptitudeQuestions.length > 0 && (
        <Aptitude 
          questions={aptitudeQuestions}
          onComplete={handleAptitudeComplete}
        />
      )}

      {stage === Stage.SELECT_PROMPTS && availablePrompts.length > 0 && (
        <PromptSelector
          availablePrompts={availablePrompts}
          onSelection={handlePromptSelection}
        />
      )}

      {stage === Stage.WRITING && (
        <Writing 
          prompt={prompts[currentPromptIndex]?.prompt || ""}
          response={prompts[currentPromptIndex]?.response || ""}
          onSubmit={handlePromptSubmit}
          currentQuestion={currentPromptIndex + 1}
          totalQuestions={prompts.length}
          isLoading={prompts.length === 0}
        />
      )}

      {stage === Stage.COMPLETE && (
        <Complete
          candidateName={candidateName}
          candidatePosition={candidatePosition}
          prompts={prompts}
          aptitudeScore={aptitudeScore}
          aptitudeTotal={aptitudeQuestions.length}
          restartAssessment={restartAssessment}
          antiCheatingMetrics={antiCheatingMetrics}
        />
      )}
    </div>
  );
};

export default AssessmentStages;
