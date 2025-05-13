
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
import { AntiCheatingMetrics as AssessmentAntiCheatingMetrics } from "@/firebase/services/assessment/types";

const Index = () => {
  useEffect(() => {
    console.log("Index page rendering");
  }, []);

  return (
    <div className="flex flex-col min-h-[80vh] w-full" data-testid="index-page">
      <AssessmentManager>
        {({
          stage,
          candidateName,
          candidatePosition,
          candidateSkills,
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
          
          let currentStageComponent;
          
          switch(stage) {
            case Stage.LANDING:
              currentStageComponent = (
                <LandingStage
                  startAssessment={startAssessment}
                  handleStageTransition={() => {}}
                />
              );
              break;
            case Stage.INFO:
              currentStageComponent = (
                <InfoStage 
                  candidateName={candidateName}
                  candidatePosition={candidatePosition}
                  handleInfoSubmit={handleInfoSubmit}
                  handleStageTransition={() => {}}
                />
              );
              break;
            case Stage.GENERATING_PROMPTS:
              currentStageComponent = <GeneratingPromptsStage />;
              break;
            case Stage.INTRO:
              currentStageComponent = (
                <IntroStage 
                  candidateName={candidateName}
                  handleStart={handleStart}
                  handleStageTransition={() => {}}
                />
              );
              break;
            case Stage.APTITUDE:
              currentStageComponent = aptitudeQuestions.length > 0 ? (
                <AptitudeStage 
                  aptitudeQuestions={aptitudeQuestions}
                  handleAptitudeComplete={handleAptitudeComplete}
                  handleStageTransition={() => {}}
                />
              ) : <div>Loading aptitude questions...</div>;
              break;
            case Stage.SELECT_PROMPTS:
              currentStageComponent = availablePrompts.length > 0 ? (
                <SelectPromptsStage
                  availablePrompts={availablePrompts}
                  handlePromptSelection={handlePromptSelection}
                  handleStageTransition={() => {}}
                />
              ) : <div>Loading prompts...</div>;
              break;
            case Stage.WRITING:
              currentStageComponent = (
                <WritingStage 
                  prompts={prompts}
                  currentPromptIndex={currentPromptIndex}
                  handlePromptSubmit={handlePromptSubmit}
                  handleStageTransition={() => {}}
                />
              );
              break;
            case Stage.COMPLETE:
              currentStageComponent = (
                <CompleteStage
                  candidateName={candidateName}
                  candidatePosition={candidatePosition}
                  prompts={prompts}
                  aptitudeScore={aptitudeScore}
                  aptitudeTotal={aptitudeQuestions.length}
                  antiCheatingMetrics={antiCheatingMetrics as AssessmentAntiCheatingMetrics}
                  restartAssessment={restartAssessment}
                  handleStageTransition={() => {}}
                />
              );
              break;
            default:
              currentStageComponent = <div>Loading...</div>;
          }
          
          return (
            <div className="assessment-container min-h-screen w-full py-6 sm:py-12 px-2 sm:px-0">
              <StageTransitioner>
                {currentStageComponent}
              </StageTransitioner>
            </div>
          );
        }}
      </AssessmentManager>
    </div>
  );
};

export default Index;
