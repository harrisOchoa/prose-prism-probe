
import { useState, useEffect } from "react";
import { Stage, WritingPromptItem } from "../types";
import { AptitudeQuestion, getRandomAptitudeQuestions } from "@/utils/aptitudeQuestions";
import { WritingPromptQuestion } from "@/utils/questionBank";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";
import { usePromptGeneration } from "./usePromptGeneration";

const APTITUDE_QUESTIONS_COUNT = 30;

export const useAssessmentState = () => {
  const [stage, setStage] = useState<Stage>(Stage.LANDING);
  const [candidateName, setCandidateName] = useState("");
  const [candidatePosition, setCandidatePosition] = useState("");
  const [candidateSkills, setCandidateSkills] = useState("");
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([]);
  
  const [prompts, setPrompts] = useState<WritingPromptItem[]>([]);
  const [aptitudeQuestions, setAptitudeQuestions] = useState<AptitudeQuestion[]>([]);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<number[]>([]);
  const [aptitudeScore, setAptitudeScore] = useState(0);
  const [antiCheatingMetrics, setAntiCheatingMetrics] = useState<AntiCheatingMetrics | undefined>(undefined);
  
  const { 
    availablePrompts, 
    isGeneratingPrompts, 
    generatePrompts 
  } = usePromptGeneration();

  // Set up session tracking
  useEffect(() => {
    const sessionId = sessionStorage.getItem("assessment-session-id") || 
                      `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("assessment-session-id", sessionId);
    console.log("Assessment session initialized:", sessionId);
  }, []);

  const startAssessment = () => {
    console.log("Starting new assessment");
    setStage(Stage.INFO);
  };

  const handleInfoSubmit = async (name: string, position: string, skills: string) => {
    console.log("Info submitted:", { name, position, skills });
    setCandidateName(name);
    setCandidatePosition(position);
    setCandidateSkills(skills);

    setStage(Stage.GENERATING_PROMPTS);
    
    try {
      await generatePrompts(position, skills);
    } finally {
      setStage(Stage.INTRO);
    }
  };

  const handleStart = () => {
    console.log("Starting aptitude test");
    const selectedAptitudeQuestions = getRandomAptitudeQuestions(APTITUDE_QUESTIONS_COUNT);
    setAptitudeQuestions(selectedAptitudeQuestions);
    console.log("Generated aptitude questions:", selectedAptitudeQuestions.length);

    setStage(Stage.APTITUDE);
  };

  const handleAptitudeComplete = (answers: number[], score: number, metrics?: AntiCheatingMetrics) => {
    // Store the answers and score
    setAptitudeAnswers(answers);
    setAptitudeScore(score);
    
    // Log the score to verify it's being saved
    console.log("Aptitude test completed with score:", score, "out of", aptitudeQuestions.length);
    console.log("Anti-cheating metrics provided:", !!metrics);
    
    // Save anti-cheating metrics if provided
    if (metrics) {
      console.log("Saving anti-cheating metrics:", metrics);
      setAntiCheatingMetrics(metrics);
    }
    
    setStage(Stage.SELECT_PROMPTS);
    setPrompts([]);
    setSelectedPromptIds([]);
    setCurrentPromptIndex(0);
  };

  const handlePromptSelection = (chosenPromptIds: number[]) => {
    console.log("Selected prompt IDs:", chosenPromptIds);
    const selectedQuestions = availablePrompts.filter(q => chosenPromptIds.includes(q.id));
    const initialPrompts: WritingPromptItem[] = selectedQuestions.map(q => ({
      ...q,
      response: "",
      wordCount: 0
    }));
    setPrompts(initialPrompts);
    setCurrentPromptIndex(0);
    setSelectedPromptIds(chosenPromptIds);
    console.log("Starting writing assessment with prompts:", initialPrompts.length);

    setStage(Stage.WRITING);
  };

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

  const restartAssessment = () => {
    console.log("Restarting assessment");
    
    // Generate a new session ID
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("assessment-session-id", newSessionId);
    console.log("New assessment session:", newSessionId);
    
    setStage(Stage.LANDING);
    setCurrentPromptIndex(0);
    setPrompts([]);
    setSelectedPromptIds([]);
    setAptitudeQuestions([]);
    setAptitudeAnswers([]);
    setAptitudeScore(0);
    setCandidateName("");
    setCandidatePosition("");
    setCandidateSkills("");
    setAntiCheatingMetrics(undefined);
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
