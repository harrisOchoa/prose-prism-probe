
import React, { useState } from "react";
import AssessmentManager, { Stage } from "@/components/AssessmentManager";
import ResumeSessionDialog from "@/components/assessment/ResumeSessionDialog";
import AssessmentStages from "@/components/assessment/stages/AssessmentStages";
import GeneratingPromptsLoader from "@/components/assessment/stages/GeneratingPromptsLoader";
import { useSessionRecovery } from "@/hooks/useSessionRecovery";

const Index = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");
  const [showGlobalDialog, setShowGlobalDialog] = useState(false);
  const [globalSessionType, setGlobalSessionType] = useState<'aptitude' | 'writing'>('aptitude');
  const [sessionProgress, setSessionProgress] = useState({ current: 0, total: 30 });
  const [resumingSession, setResumingSession] = useState(false);
  
  // Check for existing sessions at the application level
  const aptitudeSession = useSessionRecovery('aptitude', 30);
  const writingSession = useSessionRecovery('writing', 3);
  
  React.useEffect(() => {
    // Check for any existing sessions when the app loads
    if (aptitudeSession.hasExistingSession) {
      setGlobalSessionType('aptitude');
      if (aptitudeSession.sessionData) {
        setSessionProgress({
          current: aptitudeSession.sessionData.currentIndex + 1,
          total: 30
        });
      }
      setShowGlobalDialog(true);
    } else if (writingSession.hasExistingSession) {
      setGlobalSessionType('writing');
      if (writingSession.sessionData) {
        setSessionProgress({
          current: writingSession.sessionData.currentIndex + 1,
          total: 3
        });
      }
      setShowGlobalDialog(true);
    }
  }, []);

  const handleStageTransition = (newStage: Stage) => {
    setIsTransitioning(true);
    let message = "";
    
    switch (newStage) {
      case Stage.APTITUDE:
        message = "Preparing aptitude test...";
        break;
      case Stage.WRITING:
        message = "Setting up writing assessment...";
        break;
      case Stage.COMPLETE:
        message = "Finalizing your assessment...";
        break;
      default:
        message = "Loading next section...";
    }
    
    setTransitionMessage(message);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  return (
    <>
      {showGlobalDialog && (
        <ResumeSessionDialog
          open={true}
          onResume={() => {
            setShowGlobalDialog(false);
            setResumingSession(true);
            handleStageTransition(globalSessionType === 'aptitude' ? Stage.APTITUDE : Stage.WRITING);
          }}
          onDecline={() => {
            setShowGlobalDialog(false);
            if (globalSessionType === 'aptitude') {
              aptitudeSession.clearSessionData();
            } else {
              writingSession.clearSessionData();
            }
          }}
          sessionType={globalSessionType}
          progress={sessionProgress}
        />
      )}
      
      <AssessmentManager>
        {({
          stage,
          candidateName,
          candidatePosition,
          currentPromptIndex,
          prompts,
          availablePrompts,
          aptitudeQuestions,
          aptitudeScore,
          startAssessment,
          handleInfoSubmit,
          handleStart,
          handleAptitudeComplete,
          handlePromptSubmit,
          handlePromptSelection,
          restartAssessment,
          antiCheatingMetrics,
          setStage
        }) => {
          // Effect to handle session resumption by setting the correct stage
          React.useEffect(() => {
            if (resumingSession) {
              if (globalSessionType === 'aptitude') {
                setStage(Stage.APTITUDE);
              } else if (globalSessionType === 'writing') {
                if (availablePrompts.length > 0) {
                  handlePromptSelection([1, 2, 3]);
                  setStage(Stage.WRITING);
                } else {
                  setStage(Stage.SELECT_PROMPTS);
                }
              }
              setResumingSession(false);
            }
          }, [resumingSession, globalSessionType, availablePrompts.length, setStage]);

          if (stage === Stage.GENERATING_PROMPTS) {
            return <GeneratingPromptsLoader />;
          }

          return (
            <AssessmentStages
              stage={stage}
              showGlobalDialog={showGlobalDialog}
              isTransitioning={isTransitioning}
              transitionMessage={transitionMessage}
              candidateName={candidateName}
              candidatePosition={candidatePosition}
              currentPromptIndex={currentPromptIndex}
              prompts={prompts}
              availablePrompts={availablePrompts}
              aptitudeQuestions={aptitudeQuestions}
              aptitudeScore={aptitudeScore}
              antiCheatingMetrics={antiCheatingMetrics}
              onStart={startAssessment}
              onInfoSubmit={handleInfoSubmit}
              handleStart={handleStart}
              handleAptitudeComplete={handleAptitudeComplete}
              handlePromptSubmit={handlePromptSubmit}
              handlePromptSelection={handlePromptSelection}
              restartAssessment={restartAssessment}
            />
          );
        }}
      </AssessmentManager>
    </>
  );
};

export default Index;
