import React, { useState, useEffect } from "react";
import { WritingPromptQuestion, getRandomQuestions } from "@/utils/questionBank";
import { AptitudeQuestion, getRandomAptitudeQuestions } from "@/utils/aptitudeQuestions";

// Assessment stages
export enum Stage {
  LANDING,  // Landing page
  INFO,     // Name/position collection
  INTRO,    // Instructions
  APTITUDE, // Aptitude test
  WRITING,  // Writing assessment
  COMPLETE  // Thank you page
}

// Define the type for a writing prompt with response
export interface WritingPromptItem extends WritingPromptQuestion {
  response: string;
  wordCount: number;
}

// Number of questions each candidate will receive
const QUESTIONS_PER_ASSESSMENT = 3;
const APTITUDE_QUESTIONS_COUNT = 30;

interface AssessmentManagerProps {
  children: (props: {
    stage: Stage;
    candidateName: string;
    candidatePosition: string;
    currentPromptIndex: number;
    prompts: WritingPromptItem[];
    aptitudeQuestions: AptitudeQuestion[];
    aptitudeScore: number;
    startAssessment: () => void;
    handleInfoSubmit: (name: string, position: string) => void;
    handleStart: () => void;
    handleAptitudeComplete: (answers: number[], score: number) => void;
    handlePromptSubmit: (text: string) => void;
    restartAssessment: () => void;
  }) => React.ReactNode;
}

const AssessmentManager = ({ children }: AssessmentManagerProps) => {
  const [stage, setStage] = useState<Stage>(Stage.LANDING);
  const [candidateName, setCandidateName] = useState("");
  const [candidatePosition, setCandidatePosition] = useState("");
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  
  // State for storing the selected prompts
  const [prompts, setPrompts] = useState<WritingPromptItem[]>([]);
  
  // State for aptitude test
  const [aptitudeQuestions, setAptitudeQuestions] = useState<AptitudeQuestion[]>([]);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<number[]>([]);
  const [aptitudeScore, setAptitudeScore] = useState(0);
  
  // Start the assessment flow
  const startAssessment = () => {
    setStage(Stage.INFO);
  };
  
  // Initialize with random questions when candidate info is submitted
  const handleInfoSubmit = (name: string, position: string) => {
    setCandidateName(name);
    setCandidatePosition(position);
    
    setStage(Stage.INTRO);
  };
  
  const handleStart = () => {
    // Initialize the aptitude questions
    const selectedAptitudeQuestions = getRandomAptitudeQuestions(APTITUDE_QUESTIONS_COUNT);
    setAptitudeQuestions(selectedAptitudeQuestions);
    
    setStage(Stage.APTITUDE);
  };
  
  const handleAptitudeComplete = (answers: number[], score: number) => {
    setAptitudeAnswers(answers);
    setAptitudeScore(score);
    
    // Get random writing questions and initialize them with empty responses
    const selectedQuestions = getRandomQuestions(QUESTIONS_PER_ASSESSMENT);
    const initialPrompts: WritingPromptItem[] = selectedQuestions.map(question => ({
      ...question,
      response: "",
      wordCount: 0
    }));
    
    setPrompts(initialPrompts);
    setCurrentPromptIndex(0);
    setStage(Stage.WRITING);
  };
  
  const handlePromptSubmit = (text: string) => {
    // Update the current prompt's response
    const updatedPrompts = [...prompts];
    // Count words
    const words = text.trim().split(/\s+/).filter(word => word !== "");
    
    updatedPrompts[currentPromptIndex] = {
      ...updatedPrompts[currentPromptIndex],
      response: text,
      wordCount: words.length
    };
    
    setPrompts(updatedPrompts);
    
    // Move to next prompt or complete if all prompts are answered
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
    setAptitudeQuestions([]);
    setAptitudeAnswers([]);
    setAptitudeScore(0);
    setCandidateName("");
    setCandidatePosition("");
  };

  return <>{children({
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
  })}</>;
};

export default AssessmentManager;
