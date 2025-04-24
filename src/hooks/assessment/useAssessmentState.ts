
import { useState } from "react";
import { Stage } from "@/components/AssessmentManager";
import { WritingPromptQuestion, getRandomQuestions } from "@/utils/questionBank";
import { AptitudeQuestion, getRandomAptitudeQuestions } from "@/utils/aptitudeQuestions";
import { generatePositionSpecificPrompts } from "@/services/gemini/positionPrompts";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

export interface WritingPromptItem extends WritingPromptQuestion {
  response: string;
  wordCount: number;
}

const QUESTIONS_PER_ASSESSMENT = 3;
const APTITUDE_QUESTIONS_COUNT = 30;

export const useAssessmentState = (setStage: (stage: Stage) => void) => {
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
    setAptitudeAnswers(answers);
    setAptitudeScore(score);
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

  return {
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
    restartAssessment
  };
};
