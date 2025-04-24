
import React from "react";
import LandingPage from "@/components/LandingPage";
import AssessmentIntro from "@/components/AssessmentIntro";
import AptitudeTest from "@/components/AptitudeTest";
import PromptSelection from "@/components/PromptSelection";
import WritingPrompt from "@/components/WritingPrompt";
import AssessmentComplete from "@/components/AssessmentComplete";
import { Stage } from "@/components/AssessmentManager";
import StepTransition from "@/components/assessment/StepTransition";

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
        <LandingPage onStart={onStart} />
      )}

      {stage === Stage.INFO && (
        <AssessmentIntro 
          step="info" 
          candidateName={candidateName}
          candidatePosition={candidatePosition}
          onInfoSubmit={(name, position, skills) => onInfoSubmit(name, position, skills)} 
        />
      )}

      {stage === Stage.INTRO && (
        <AssessmentIntro 
          step="instructions" 
          candidateName={candidateName}
          onStart={handleStart} 
        />
      )}

      {stage === Stage.APTITUDE && aptitudeQuestions.length > 0 && (
        <AptitudeTest 
          questions={aptitudeQuestions}
          onComplete={handleAptitudeComplete}
          timeLimit={30 * 60}
        />
      )}

      {stage === Stage.SELECT_PROMPTS && availablePrompts.length > 0 && (
        <PromptSelection
          availablePrompts={availablePrompts}
          onSelection={handlePromptSelection}
          minSelect={1}
          maxSelect={availablePrompts.length}
        />
      )}

      {stage === Stage.WRITING && (
        <WritingPrompt 
          prompt={prompts[currentPromptIndex]?.prompt || ""}
          response={prompts[currentPromptIndex]?.response || ""}
          timeLimit={30 * 60}
          onSubmit={handlePromptSubmit}
          currentQuestion={currentPromptIndex + 1}
          totalQuestions={prompts.length}
          isLoading={prompts.length === 0}
        />
      )}

      {stage === Stage.COMPLETE && (
        <AssessmentComplete
          wordCount={prompts.reduce((total, prompt) => total + prompt.wordCount, 0)}
          candidateName={candidateName}
          candidatePosition={candidatePosition}
          restartAssessment={restartAssessment}
          completedPrompts={prompts}
          aptitudeScore={aptitudeScore}
          aptitudeTotal={aptitudeQuestions.length}
          antiCheatingMetrics={antiCheatingMetrics}
        />
      )}
    </div>
  );
};

export default AssessmentStages;
