
import { useCallback } from "react";
import { Stage, WritingPromptItem } from "../types";
import { getRandomAptitudeQuestions } from "@/utils/aptitudeQuestions";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";
import { WritingPromptQuestion } from "@/utils/questionBank";

const APTITUDE_QUESTIONS_COUNT = 30;

interface UseAssessmentActionsProps {
  stage: Stage;
  setStage: (stage: Stage) => void;
  availablePrompts: any[];
  generatePrompts: (position: string, skills: string) => Promise<WritingPromptQuestion[]>;
  prompts: WritingPromptItem[];
  setPrompts: (prompts: WritingPromptItem[]) => void;
  currentPromptIndex: number;
  setCurrentPromptIndex: (index: number) => void;
  setSelectedPromptIds: (ids: number[]) => void;
  setAptitudeQuestions: (questions: any[]) => void;
  setAptitudeAnswers: (answers: number[]) => void;
  setAptitudeScore: (score: number) => void;
  setAntiCheatingMetrics: (metrics: AntiCheatingMetrics | undefined) => void;
  setCandidateName: (name: string) => void;
  setCandidatePosition: (position: string) => void;
  setCandidateSkills: (skills: string) => void;
  resetAssessmentData: () => void;
  aptitudeQuestions: any[];
}

export const useAssessmentActions = ({
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
}: UseAssessmentActionsProps) => {

  const startAssessment = useCallback(() => {
    console.log("Starting new assessment");
    setStage(Stage.INFO);
  }, [setStage]);

  const handleInfoSubmit = useCallback(async (name: string, position: string, skills: string) => {
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
  }, [setCandidateName, setCandidatePosition, setCandidateSkills, setStage, generatePrompts]);

  const handleStart = useCallback(() => {
    console.log("Starting aptitude test");
    const selectedAptitudeQuestions = getRandomAptitudeQuestions(APTITUDE_QUESTIONS_COUNT);
    setAptitudeQuestions(selectedAptitudeQuestions);
    console.log("Generated aptitude questions:", selectedAptitudeQuestions.length);

    setStage(Stage.APTITUDE);
  }, [setAptitudeQuestions, setStage]);

  const handleAptitudeComplete = useCallback((answers: number[], score: number, metrics?: AntiCheatingMetrics) => {
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
  }, [setAptitudeAnswers, setAptitudeScore, setAntiCheatingMetrics, setStage, setPrompts, setSelectedPromptIds, setCurrentPromptIndex, aptitudeQuestions.length]);

  const handlePromptSelection = useCallback((chosenPromptIds: number[]) => {
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
  }, [availablePrompts, setPrompts, setCurrentPromptIndex, setSelectedPromptIds, setStage]);

  const restartAssessment = useCallback(() => {
    console.log("Restarting assessment");
    
    // Generate a new session ID
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("assessment-session-id", newSessionId);
    console.log("New assessment session:", newSessionId);
    
    setStage(Stage.LANDING);
    resetAssessmentData();
  }, [setStage, resetAssessmentData]);

  return {
    startAssessment,
    handleInfoSubmit,
    handleStart,
    handleAptitudeComplete,
    handlePromptSelection,
    restartAssessment
  };
};
