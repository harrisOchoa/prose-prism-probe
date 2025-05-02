
import React, { useEffect } from "react";
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
  useEffect(() => {
    console.log("Index page rendering");
  }, []);

  return (
    <div className="flex flex-col min-h-[80vh]" data-testid="index-page">
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
        }) => {
          console.log("AssessmentManager rendering, current stage:", stage);
          
          return (
            <div className="assessment-container min-h-screen py-6 sm:py-12 px-2 sm:px-0">
              <StageTransitioner>
                {stage === Stage.LANDING && (
                  <LandingStage
                    startAssessment={startAssessment}
                    handleStageTransition={() => {}}
                  />
                )}

                {stage === Stage.INFO && (
                  <InfoStage 
                    candidateName={candidateName}
                    candidatePosition={candidatePosition}
                    handleInfoSubmit={handleInfoSubmit}
                    handleStageTransition={() => {}}
                  />
                )}

                {stage === Stage.GENERATING_PROMPTS && (
                  <GeneratingPromptsStage />
                )}

                {stage === Stage.INTRO && (
                  <IntroStage 
                    candidateName={candidateName}
                    handleStart={handleStart}
                    handleStageTransition={() => {}}
                  />
                )}

                {stage === Stage.APTITUDE && aptitudeQuestions.length > 0 && (
                  <AptitudeStage 
                    aptitudeQuestions={aptitudeQuestions}
                    handleAptitudeComplete={handleAptitudeComplete}
                    handleStageTransition={() => {}}
                  />
                )}

                {stage === Stage.SELECT_PROMPTS && availablePrompts.length > 0 && (
                  <SelectPromptsStage
                    availablePrompts={availablePrompts}
                    handlePromptSelection={handlePromptSelection}
                    handleStageTransition={() => {}}
                  />
                )}

                {stage === Stage.WRITING && (
                  <WritingStage 
                    prompts={prompts}
                    currentPromptIndex={currentPromptIndex}
                    handlePromptSubmit={handlePromptSubmit}
                    handleStageTransition={() => {}}
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
                    handleStageTransition={() => {}}
                  />
                )}
              </StageTransitioner>
            </div>
          );
        }}
      </AssessmentManager>
    </div>
  );
};

export default Index;
