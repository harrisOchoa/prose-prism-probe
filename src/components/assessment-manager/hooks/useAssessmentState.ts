
import { useState, useEffect } from "react";
import { Stage, WritingPromptItem } from "../types";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";
import { usePromptGeneration } from "./usePromptGeneration";
import { useAssessmentData } from "./useAssessmentData";
import { useAssessmentActions } from "./useAssessmentActions";

export const useAssessmentState = () => {
  const [stage, setStage] = useState<Stage>(Stage.LANDING);
  
  const { 
    availablePrompts, 
    isGeneratingPrompts, 
    generatePrompts 
  } = usePromptGeneration();

  const {
    candidateName,
    setCandidateName,
    candidatePosition,
    setCandidatePosition,
    candidateSkills,
    setCandidateSkills,
    currentPromptIndex,
    setCurrentPromptIndex,
    selectedPromptIds,
    setSelectedPromptIds,
    prompts,
    setPrompts,
    aptitudeQuestions,
    setAptitudeQuestions,
    aptitudeAnswers,
    setAptitudeAnswers,
    aptitudeScore,
    setAptitudeScore,
    antiCheatingMetrics,
    setAntiCheatingMetrics,
    resetAssessmentData
  } = useAssessmentData();

  const {
    startAssessment,
    handleInfoSubmit,
    handleStart,
    handleAptitudeComplete,
    handlePromptSelection,
    restartAssessment
  } = useAssessmentActions({
    stage,
    setStage,
    availablePrompts,
    generatePrompts,
    prompts,
    setPrompts,
    currentPromptIndex,
    setCurrentPromptIndex,
    setSelectedPromptIds,
    setAptitudeQuestions,
    setAptitudeAnswers,
    setAptitudeScore,
    setAntiCheatingMetrics,
    setCandidateName,
    setCandidatePosition,
    setCandidateSkills,
    resetAssessmentData,
    aptitudeQuestions
  });

  // Set up session tracking
  useEffect(() => {
    const sessionId = sessionStorage.getItem("assessment-session-id") || 
                      `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("assessment-session-id", sessionId);
    console.log("Assessment session initialized:", sessionId);
  }, []);

  const handlePromptSubmit = (text: string, metrics?: AntiCheatingMetrics) => {
    console.log("Prompt submitted for index:", currentPromptIndex);
    const updatedPrompts = [...prompts];
    const words = text.trim().split(/\s+/).filter(word => word !== "");
    const wordCount = words.length;
    console.log("Response word count:", wordCount);
    
    updatedPrompts[currentPromptIndex] = {
      ...updatedPrompts[currentPromptIndex],
      response: text,
      wordCount: wordCount
    };
    setPrompts(updatedPrompts);

    if (metrics) {
      console.log("Updating anti-cheating metrics");
      setAntiCheatingMetrics(prev => {
        // Combine metrics from multiple prompts if needed
        if (prev) {
          return {
            ...metrics,
            keystrokes: (prev.keystrokes || 0) + (metrics.keystrokes || 0),
            pauses: (prev.pauses || 0) + (metrics.pauses || 0),
            tabSwitches: (prev.tabSwitches || 0) + (metrics.tabSwitches || 0),
            copyAttempts: (prev.copyAttempts || 0) + (metrics.copyAttempts || 0),
            pasteAttempts: (prev.pasteAttempts || 0) + (metrics.pasteAttempts || 0),
            rightClickAttempts: (prev.rightClickAttempts || 0) + (metrics.rightClickAttempts || 0),
            windowBlurs: (prev.windowBlurs || 0) + (metrics.windowBlurs || 0),
            windowFocuses: (prev.windowFocuses || 0) + (metrics.windowFocuses || 0),
            suspiciousActivity: prev.suspiciousActivity || metrics.suspiciousActivity
          };
        }
        return metrics;
      });
    }

    if (currentPromptIndex < prompts.length - 1) {
      console.log("Moving to next prompt");
      setCurrentPromptIndex(currentPromptIndex + 1);
    } else {
      console.log("All prompts completed, moving to completion stage");
      // Log final assessment data
      console.log("Final assessment data:");
      console.log("- Candidate:", candidateName);
      console.log("- Position:", candidatePosition);
      console.log("- Aptitude Score:", aptitudeScore, "out of", aptitudeQuestions.length);
      console.log("- Writing Prompts Completed:", prompts.length);
      console.log("- Total Word Count:", updatedPrompts.reduce((sum, p) => sum + p.wordCount, 0));
      
      setStage(Stage.COMPLETE);
    }
  };

  return {
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
    isGeneratingPrompts,
    startAssessment,
    handleInfoSubmit,
    handleStart,
    handleAptitudeComplete,
    handlePromptSubmit,
    handlePromptSelection,
    restartAssessment
  };
};
