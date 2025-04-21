
import React, { useState, useEffect } from "react";
import { WritingPromptQuestion, getRandomQuestions } from "@/utils/questionBank";
import { AptitudeQuestion, getRandomAptitudeQuestions } from "@/utils/aptitudeQuestions";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";
import { generatePositionSpecificPrompts } from "@/services/gemini/positionPrompts";

// Assessment stages
export enum Stage {
  LANDING,  // Landing page
  INFO,     // Name/position collection
  INTRO,    // Instructions
  GENERATING_PROMPTS, // Added: prompt generation after info
  SELECT_PROMPTS, // Added: prompt selection before writing
  APTITUDE, // Aptitude test
  WRITING,  // Writing assessment
  COMPLETE  // Thank you page
}

// Define the type for a writing prompt with response
export interface WritingPromptItem extends WritingPromptQuestion {
  response: string;
  wordCount: number;
}

const QUESTIONS_PER_ASSESSMENT = 3;
const APTITUDE_QUESTIONS_COUNT = 30;

interface AssessmentManagerProps {
  children: (props: {
    stage: Stage;
    candidateName: string;
    candidatePosition: string;
    currentPromptIndex: number;
    prompts: WritingPromptItem[];
    availablePrompts: WritingPromptQuestion[];
    selectedPromptIds: number[];
    aptitudeQuestions: AptitudeQuestion[];
    aptitudeScore: number;
    antiCheatingMetrics?: AntiCheatingMetrics;
    startAssessment: () => void;
    handleInfoSubmit: (name: string, position: string) => void;
    handleStart: () => void;
    handleAptitudeComplete: (answers: number[], score: number) => void;
    handlePromptSubmit: (text: string, metrics?: AntiCheatingMetrics) => void;
    handlePromptSelection: (selectedPromptIds: number[]) => void;
    restartAssessment: () => void;
  }) => React.ReactNode;
}

const AssessmentManager = ({ children }: AssessmentManagerProps) => {
  const [stage, setStage] = useState<Stage>(Stage.LANDING);
  const [candidateName, setCandidateName] = useState("");
  const [candidatePosition, setCandidatePosition] = useState("");
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [usePositionPrompts] = useState(true);

  // * Available prompts to pick from (shown on selection page)
  const [availablePrompts, setAvailablePrompts] = useState<WritingPromptQuestion[]>([]);
  // * Prompts the candidate decided to answer
  const [prompts, setPrompts] = useState<WritingPromptItem[]>([]);
  // * Store selected prompt ids for highlighting in UI
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([]);

  // State for aptitude test
  const [aptitudeQuestions, setAptitudeQuestions] = useState<AptitudeQuestion[]>([]);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<number[]>([]);
  const [aptitudeScore, setAptitudeScore] = useState(0);

  // State for generating prompts
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

  // State for anti-cheating metrics
  const [antiCheatingMetrics, setAntiCheatingMetrics] = useState<AntiCheatingMetrics | undefined>(undefined);

  // Start the assessment flow
  const startAssessment = () => {
    setStage(Stage.INFO);
  };

  // Generate position-specific prompts when candidate info is submitted
  const handleInfoSubmit = async (name: string, position: string) => {
    setCandidateName(name);
    setCandidatePosition(position);

    setStage(Stage.GENERATING_PROMPTS);
    setIsGeneratingPrompts(true);
    try {
      let questions: WritingPromptQuestion[];
      if (usePositionPrompts && position) {
        questions = await generatePositionSpecificPrompts(position, QUESTIONS_PER_ASSESSMENT);
      } else {
        questions = getRandomQuestions(QUESTIONS_PER_ASSESSMENT);
      }
      setAvailablePrompts(questions);
    } catch (e) {
      setAvailablePrompts(getRandomQuestions(QUESTIONS_PER_ASSESSMENT));
    } finally {
      setIsGeneratingPrompts(false);
      setStage(Stage.INTRO);
    }
  };

  const handleStart = () => {
    // Initialize the aptitude questions
    const selectedAptitudeQuestions = getRandomAptitudeQuestions(APTITUDE_QUESTIONS_COUNT);
    setAptitudeQuestions(selectedAptitudeQuestions);

    setStage(Stage.APTITUDE);
  };

  // After aptitude test, show candidate the prompt selection page
  const handleAptitudeComplete = () => {
    setStage(Stage.SELECT_PROMPTS);
    setPrompts([]);
    setSelectedPromptIds([]);
    setCurrentPromptIndex(0);
  };

  // Candidate selects which prompts to answer (at least one)
  const handlePromptSelection = (chosenPromptIds: number[]) => {
    const selectedQuestions = availablePrompts.filter(q => chosenPromptIds.includes(q.id));
    // Initialize prompts with empty responses and word count for each selection
    const initialPrompts: WritingPromptItem[] = selectedQuestions.map(q => ({
      ...q,
      response: "",
      wordCount: 0
    }));
    setPrompts(initialPrompts);
    setCurrentPromptIndex(0);
    setSelectedPromptIds(chosenPromptIds);

    setStage(Stage.WRITING);
  };

  const handlePromptSubmit = (text: string, metrics?: AntiCheatingMetrics) => {
    const updatedPrompts = [...prompts];
    const words = text.trim().split(/\s+/).filter(word => word !== "");
    updatedPrompts[currentPromptIndex] = {
      ...updatedPrompts[currentPromptIndex],
      response: text,
      wordCount: words.length
    };
    setPrompts(updatedPrompts);

    if (metrics) {
      setAntiCheatingMetrics(metrics);
    }

    // Move to next selected prompt or finish
    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    } else {
      setStage(Stage.COMPLETE);
    }
  };

  const restartAssessment = () => {
    setStage(Stage.LANDING);
    setCurrentPromptIndex(0);
    setPrompts([]);
    setAvailablePrompts([]);
    setSelectedPromptIds([]);
    setAptitudeQuestions([]);
    setAptitudeAnswers([]);
    setAptitudeScore(0);
    setCandidateName("");
    setCandidatePosition("");
    setAntiCheatingMetrics(undefined);
  };

  return <>{children({
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
  })}</>;
};

export default AssessmentManager;
