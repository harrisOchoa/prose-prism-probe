
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AssessmentIntro from "@/components/AssessmentIntro";
import WritingPrompt from "@/components/WritingPrompt";
import AssessmentComplete from "@/components/AssessmentComplete";
import AptitudeTest from "@/components/AptitudeTest";
import LandingPage from "@/components/LandingPage";
import AssessmentManager, { Stage } from "@/components/AssessmentManager";
import PromptSelection from "@/components/PromptSelection";
import StepTransition from "@/components/assessment/StepTransition";

const loadingMessages = [
  "Preparing your assessment\u2026",
  "Getting your assessment ready\u2026",
  "Loading your assessment\u2026"
];

const Index = () => {
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleStageTransition = (newStage: Stage) => {
    setIsTransitioning(true);
    let message = "";
    let stageParam = "";
    
    switch (newStage) {
      case Stage.APTITUDE:
        message = "Preparing aptitude test...";
        stageParam = "aptitude";
        break;
      case Stage.WRITING:
        message = "Setting up writing assessment...";
        stageParam = "writing";
        break;
      case Stage.COMPLETE:
        message = "Finalizing your assessment...";
        stageParam = "complete";
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
        startAssessment,
        handleInfoSubmit,
        handleStart,
        handleAptitudeComplete,
        handlePromptSubmit,
        handlePromptSelection,
        restartAssessment,
        antiCheatingMetrics
      }) => (
        <div className="assessment-container min-h-screen py-6 sm:py-12 px-2 sm:px-0">
          <StepTransition loading={isTransitioning} message={transitionMessage} />

          {stage === Stage.LANDING && (
            <LandingPage onStart={() => {
              handleStageTransition(Stage.INFO);
              startAssessment();
            }} />
          )}

          {stage === Stage.INFO && (
            <AssessmentIntro 
              step="info" 
              candidateName={candidateName}
              candidatePosition={candidatePosition}
              onInfoSubmit={(name, position, skills) => {
                handleStageTransition(Stage.GENERATING_PROMPTS);
                handleInfoSubmit(name, position, skills);
              }} 
            />
          )}

          {stage === Stage.GENERATING_PROMPTS && (
            <div className="w-full min-h-[40vh] flex flex-col items-center justify-center">
              <div className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-7 w-7 border-2 border-primary border-t-transparent mr-2"></span>
                <span className="text-lg font-medium">{loadingMessages[loadingIndex]}</span>
              </div>
            </div>
          )}

          {stage === Stage.INTRO && (
            <AssessmentIntro 
              step="instructions" 
              candidateName={candidateName}
              onStart={() => {
                handleStageTransition(Stage.APTITUDE);
                handleStart();
              }} 
            />
          )}

          {stage === Stage.APTITUDE && aptitudeQuestions.length > 0 && (
            <AptitudeTest 
              questions={aptitudeQuestions}
              onComplete={(answers, score, metrics) => {
                console.log("Aptitude test completed with score:", score, "out of", aptitudeQuestions.length);
                handleStageTransition(Stage.SELECT_PROMPTS);
                handleAptitudeComplete(answers, score, metrics);
              }}
              timeLimit={30 * 60} // 30 minutes in seconds
            />
          )}

          {stage === Stage.SELECT_PROMPTS && availablePrompts.length > 0 && (
            <PromptSelection
              availablePrompts={availablePrompts}
              onSelection={(selectedIds) => {
                handleStageTransition(Stage.WRITING);
                handlePromptSelection(selectedIds);
              }}
              minSelect={1}
              maxSelect={availablePrompts.length}
            />
          )}

          {stage === Stage.WRITING && (
            <WritingPrompt 
              prompt={prompts[currentPromptIndex]?.prompt || ""}
              response={prompts[currentPromptIndex]?.response || ""}
              timeLimit={30 * 60} // 30 minutes in seconds
              onSubmit={(text, metrics) => {
                const isLastPrompt = currentPromptIndex === prompts.length - 1;
                if (isLastPrompt) {
                  handleStageTransition(Stage.COMPLETE);
                }
                handlePromptSubmit(text, metrics);
              }}
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
              restartAssessment={() => {
                handleStageTransition(Stage.LANDING);
                restartAssessment();
              }}
              completedPrompts={prompts}
              aptitudeScore={aptitudeScore}
              aptitudeTotal={aptitudeQuestions.length}
              antiCheatingMetrics={antiCheatingMetrics}
            />
          )}
        </div>
      )}
    </AssessmentManager>
  );
};

export default Index;
