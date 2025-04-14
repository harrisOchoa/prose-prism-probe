
import React from "react";
import AssessmentIntro from "@/components/AssessmentIntro";
import WritingPrompt from "@/components/WritingPrompt";
import AssessmentComplete from "@/components/AssessmentComplete";
import AptitudeTest from "@/components/AptitudeTest";
import LandingPage from "@/components/LandingPage";
import AssessmentManager, { Stage } from "@/components/AssessmentManager";

const Index = () => {
  return (
    <AssessmentManager>
      {({
        stage,
        candidateName,
        candidatePosition,
        currentPromptIndex,
        prompts,
        aptitudeQuestions,
        aptitudeScore,
        startAssessment,
        handleInfoSubmit,
        handleStart,
        handleAptitudeComplete,
        handlePromptSubmit,
        restartAssessment
      }) => (
        <div className="assessment-container min-h-screen py-12">
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
          
          {stage === Stage.WRITING && prompts.length > 0 && (
            <WritingPrompt 
              prompt={prompts[currentPromptIndex].prompt}
              response={prompts[currentPromptIndex].response}
              timeLimit={30 * 60} // 30 minutes in seconds
              onSubmit={handlePromptSubmit}
              currentQuestion={currentPromptIndex + 1}
              totalQuestions={prompts.length}
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
            />
          )}
        </div>
      )}
    </AssessmentManager>
  );
};

export default Index;
