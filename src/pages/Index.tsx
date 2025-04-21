
import React from "react";
import AssessmentIntro from "@/components/AssessmentIntro";
import WritingPrompt from "@/components/WritingPrompt";
import AssessmentComplete from "@/components/AssessmentComplete";
import AptitudeTest from "@/components/AptitudeTest";
import LandingPage from "@/components/LandingPage";
import AssessmentManager, { Stage } from "@/components/AssessmentManager";
import PromptSelection from "@/components/PromptSelection";

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
          {stage === Stage.LANDING && (
            <LandingPage onStart={startAssessment} />
          )}

          {stage === Stage.INFO && (
            <AssessmentIntro 
              step="info" 
              candidateName={candidateName}
              candidatePosition={candidatePosition}
              onInfoSubmit={handleInfoSubmit} 
            />
          )}

          {stage === Stage.GENERATING_PROMPTS && (
            <div className="w-full min-h-[40vh] flex flex-col items-center justify-center">
              <div className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-7 w-7 border-2 border-primary border-t-transparent mr-2"></span>
                <span className="text-lg font-medium">Readying the assessment for you...</span>
              </div>
            </div>
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
              timeLimit={30 * 60} // 30 minutes in seconds
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
              timeLimit={30 * 60} // 30 minutes in seconds
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
      )}
    </AssessmentManager>
  );
};

export default Index;

