
import React, { useState, useEffect } from "react";
import AssessmentManager, { Stage } from "@/components/AssessmentManager";
import ResumeSessionDialog from "@/components/assessment/ResumeSessionDialog";
import AssessmentStages from "@/components/assessment/stages/AssessmentStages";
import GeneratingPromptsLoader from "@/components/assessment/stages/GeneratingPromptsLoader";
import { useSessionRecovery } from "@/hooks/useSessionRecovery";
import { useLocation } from "react-router-dom";

const Index = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");
  const [showGlobalDialog, setShowGlobalDialog] = useState(false);
  const [globalSessionType, setGlobalSessionType] = useState<'aptitude' | 'writing'>('aptitude');
  const [sessionProgress, setSessionProgress] = useState({ current: 0, total: 30 });
  const [resumingSession, setResumingSession] = useState(false);
  const location = useLocation();
  
  // Check for existing sessions at the application level
  const aptitudeSession = useSessionRecovery('aptitude', 30);
  const writingSession = useSessionRecovery('writing', 3);
  
  // Global function to clear ALL session data
  const clearAllSessionData = () => {
    // Clear all possible localStorage keys that could cause session persistence
    const allPossibleKeys = [
      'assessment_session_aptitude_data',
      'assessment_session_writing_data',
      'aptitude_timer',
      'writing_timer'
    ];
    
    allPossibleKeys.forEach(key => localStorage.removeItem(key));
    
    // Use the hooks to clear session data properly
    aptitudeSession.clearSessionData();
    writingSession.clearSessionData();
    
    // Hide the dialog
    setShowGlobalDialog(false);
  };
  
  // Special effect to handle landing page - always clear sessions when landing on root
  useEffect(() => {
    if (location.pathname === '/') {
      // Check if we're coming from another page by checking session storage
      const fromSession = sessionStorage.getItem('from_session_reset');
      if (fromSession === 'true') {
        // Already handled a reset, clear the flag
        sessionStorage.removeItem('from_session_reset');
      } else {
        // Clear all session data when visiting the landing page directly
        clearAllSessionData();
      }
    }
  }, [location.pathname]);
  
  useEffect(() => {
    // Small delay to ensure any previous session clearing has taken effect
    const checkForSessions = setTimeout(() => {
      // Only check for sessions if we're not in the process of resetting
      const isResetting = sessionStorage.getItem('from_session_reset');
      if (isResetting === 'true') {
        return;
      }
      
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
    }, 300);
    
    return () => clearTimeout(checkForSessions);
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

  // Handle dialog decline more thoroughly
  const handleDeclineDialog = () => {
    // Set a flag that we're coming from a reset
    sessionStorage.setItem('from_session_reset', 'true');
    
    // Clear all session data
    clearAllSessionData();
    
    // Force reload to ensure a clean state
    window.location.reload();
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
          onDecline={handleDeclineDialog}
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
