
import { useState } from "react";
import { WritingPromptItem } from "../types";
import { AptitudeQuestion } from "@/utils/aptitudeQuestions";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

export const useAssessmentData = () => {
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

  const resetAssessmentData = () => {
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
  };
};
