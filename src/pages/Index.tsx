
import React from "react";
import AssessmentManager, { Stage } from "@/components/AssessmentManager";
import StageTransitioner from "@/components/stages/StageTransitioner";
import LandingStage from "@/components/stages/LandingStage";
import InfoStage from "@/components/stages/InfoStage";
import GeneratingPromptsStage from "@/components/stages/GeneratingPromptsStage";
import IntroStage from "@/components/stages/IntroStage";
import AptitudeStage from "@/components/stages/AptitudeStage";
import SelectPromptsStage from "@/components/stages/SelectPromptsStage";
import WritingStage from "@/components/stages/WritingStage";
import CompleteStage from "@/components/stages/CompleteStage";

const Index = () => {
  return (
    <AssessmentManager>
      {({
        stage,
        candidateName,
        candidatePosition,
        currentPromptIndex,
        prompts,
        availablePrompts,
        selectedPromptIds,
        aptitudeQuestions,
        aptitudeScore,
        antiCheatingMetrics,
        startAssessment,
        handleInfoSubmit,
        handleStart,
        handleAptitudeComplete,
        handlePromptSubmit,
        handlePromptSelection,
        restartAssessment
      }) => (
        <div className="assessment-container min-h-screen py-6 sm:py-12 px-2 sm:px-0">
          <StageTransitioner>
            {stage === Stage.LANDING && (
              <LandingStage
                onStartAssessment={startAssessment}
                startAssessment={startAssessment}
              />
            )}

            {stage === Stage.INFO && (
              <InfoStage 
                candidateName={candidateName}
                candidatePosition={candidatePosition}
                handleInfoSubmit={handleInfoSubmit}
              />
            )}

            {stage === Stage.GENERATING_PROMPTS && (
              <GeneratingPromptsStage />
            )}

            {stage === Stage.INTRO && (
              <IntroStage 
                candidateName={candidateName}
                handleStart={handleStart}
              />
            )}

            {stage === Stage.APTITUDE && aptitudeQuestions.length > 0 && (
              <AptitudeStage 
                aptitudeQuestions={aptitudeQuestions}
                handleAptitudeComplete={handleAptitudeComplete}
              />
            )}

            {stage === Stage.SELECT_PROMPTS && availablePrompts.length > 0 && (
              <SelectPromptsStage
                availablePrompts={availablePrompts}
                handlePromptSelection={handlePromptSelection}
              />
            )}

            {stage === Stage.WRITING && (
              <WritingStage 
                prompts={prompts}
                currentPromptIndex={currentPromptIndex}
                handlePromptSubmit={handlePromptSubmit}
              />
            )}

            {stage === Stage.COMPLETE && (
              <CompleteStage
                candidateName={candidateName}
                candidatePosition={candidatePosition}
                prompts={prompts}
                aptitudeScore={aptitudeScore}
                aptitudeTotal={aptitudeQuestions.length}
                antiCheatingMetrics={antiCheatingMetrics}
                restartAssessment={restartAssessment}
              />
            )}
          </StageTransitioner>
        </div>
      )}
    </AssessmentManager>
  );
};

export default Index;
