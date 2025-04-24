
import React, { useState, useEffect } from "react";
import { WritingPromptQuestion, getRandomQuestions } from "@/utils/questionBank";
import { AptitudeQuestion, getRandomAptitudeQuestions } from "@/utils/aptitudeQuestions";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";
import { generatePositionSpecificPrompts } from "@/services/gemini/positionPrompts";
import { useLocation, useNavigate } from "react-router-dom";

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

// Map stages to URL paths for routing
export const stageToPath = {
  [Stage.LANDING]: "/",
  [Stage.INFO]: "/info",
  [Stage.INTRO]: "/intro",
  [Stage.GENERATING_PROMPTS]: "/generating-prompts",
  [Stage.SELECT_PROMPTS]: "/select-prompts",
  [Stage.APTITUDE]: "/aptitude",
  [Stage.WRITING]: "/writing",
  [Stage.COMPLETE]: "/complete"
};

// Map URL paths back to stages
export const pathToStage = {
  "/": Stage.LANDING,
  "/info": Stage.INFO,
  "/intro": Stage.INTRO,
  "/generating-prompts": Stage.GENERATING_PROMPTS,
  "/select-prompts": Stage.SELECT_PROMPTS,
  "/aptitude": Stage.APTITUDE,
  "/writing": Stage.WRITING,
  "/complete": Stage.COMPLETE
};

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
    candidateSkills: string;
    currentPromptIndex: number;
    prompts: WritingPromptItem[];
    availablePrompts: WritingPromptQuestion[];
    selectedPromptIds: number[];
    aptitudeQuestions: AptitudeQuestion[];
    aptitudeScore: number;
    antiCheatingMetrics?: AntiCheatingMetrics;
    startAssessment: () => void;
    handleInfoSubmit: (name: string, position: string, skills: string) => void;
    handleStart: () => void;
    handleAptitudeComplete: (answers: number[], score: number, metrics?: AntiCheatingMetrics) => void;
    handlePromptSubmit: (text: string, metrics?: AntiCheatingMetrics) => void;
    handlePromptSelection: (selectedPromptIds: number[]) => void;
    restartAssessment: () => void;
    setStage: (stage: Stage) => void; // Added to expose setStage
  }) => React.ReactNode;
}

const AssessmentManager = ({ children }: AssessmentManagerProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>(Stage.LANDING);
  const [candidateName, setCandidateName] = useState("");
  const [candidatePosition, setCandidatePosition] = useState("");
  const [candidateSkills, setCandidateSkills] = useState("");
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [usePositionPrompts] = useState(true);

  const [availablePrompts, setAvailablePrompts] = useState<WritingPromptQuestion[]>([]);
  const [prompts, setPrompts] = useState<WritingPromptItem[]>([]);
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([]);

  const [aptitudeQuestions, setAptitudeQuestions] = useState<AptitudeQuestion[]>([]);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<number[]>([]);
  const [aptitudeScore, setAptitudeScore] = useState(0);

  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

  const [antiCheatingMetrics, setAntiCheatingMetrics] = useState<AntiCheatingMetrics | undefined>(undefined);
  
  // Sync URL with stage
  useEffect(() => {
    // Only update the URL if this isn't the initial load or if the path doesn't match the stage
    if (location.pathname !== stageToPath[stage]) {
      navigate(stageToPath[stage], { replace: true });
    }
  }, [stage, navigate, location.pathname]);
  
  // Sync stage with URL on initial load or URL change
  useEffect(() => {
    const pathname = location.pathname;
    // Check if the current path maps to a known stage
    if (pathname in pathToStage) {
      const newStage = pathToStage[pathname as keyof typeof pathToStage];
      setStage(newStage);
    } else if (pathname !== '/' && pathname !== '/admin' && pathname !== '/view') {
      // If unknown path and not the admin/view paths, redirect to landing
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  const startAssessment = () => {
    setStage(Stage.INFO);
  };

  const handleInfoSubmit = async (name: string, position: string, skills: string) => {
    setCandidateName(name);
    setCandidatePosition(position);
    setCandidateSkills(skills);

    setStage(Stage.GENERATING_PROMPTS);
    setIsGeneratingPrompts(true);
    try {
      let questions: WritingPromptQuestion[];
      if (usePositionPrompts && position) {
        questions = await generatePositionSpecificPrompts(position, QUESTIONS_PER_ASSESSMENT, skills);
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
    const selectedAptitudeQuestions = getRandomAptitudeQuestions(APTITUDE_QUESTIONS_COUNT);
    setAptitudeQuestions(selectedAptitudeQuestions);

    setStage(Stage.APTITUDE);
  };

  const handleAptitudeComplete = (answers: number[], score: number, metrics?: AntiCheatingMetrics) => {
    // Store the answers and score
    setAptitudeAnswers(answers);
    setAptitudeScore(score);
    
    // Log the score to verify it's being saved
    console.log("Aptitude test completed with score:", score, "out of", aptitudeQuestions.length);
    
    // Save anti-cheating metrics if provided
    if (metrics) {
      setAntiCheatingMetrics(metrics);
    }
    
    setStage(Stage.SELECT_PROMPTS);
    setPrompts([]);
    setSelectedPromptIds([]);
    setCurrentPromptIndex(0);
  };

  const handlePromptSelection = (chosenPromptIds: number[]) => {
    const selectedQuestions = availablePrompts.filter(q => chosenPromptIds.includes(q.id));
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
    setCandidateSkills("");
    setAntiCheatingMetrics(undefined);
  };

  return <>{children({
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
    restartAssessment,
    setStage
  })}</>;
};

export default AssessmentManager;
