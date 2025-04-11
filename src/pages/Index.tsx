
import { useState, useEffect } from "react";
import AssessmentIntro from "@/components/AssessmentIntro";
import WritingPrompt from "@/components/WritingPrompt";
import AssessmentComplete from "@/components/AssessmentComplete";
import AptitudeTest from "@/components/AptitudeTest";
import { getRandomQuestions, WritingPromptQuestion } from "@/utils/questionBank";
import { getRandomAptitudeQuestions, AptitudeQuestion } from "@/utils/aptitudeQuestions";

// Assessment stages
enum Stage {
  INFO,
  INTRO,
  APTITUDE,
  WRITING,
  COMPLETE
}

// Define the type for a writing prompt with response
interface WritingPromptItem extends WritingPromptQuestion {
  response: string;
  wordCount: number;
}

// Number of questions each candidate will receive
const QUESTIONS_PER_ASSESSMENT = 3;
const APTITUDE_QUESTIONS_COUNT = 25;

const Index = () => {
  const [stage, setStage] = useState<Stage>(Stage.INFO);
  const [candidateName, setCandidateName] = useState("");
  const [candidatePosition, setCandidatePosition] = useState("");
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  
  // State for storing the selected prompts
  const [prompts, setPrompts] = useState<WritingPromptItem[]>([]);
  
  // State for aptitude test
  const [aptitudeQuestions, setAptitudeQuestions] = useState<AptitudeQuestion[]>([]);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<number[]>([]);
  const [aptitudeScore, setAptitudeScore] = useState(0);
  
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
    setStage(Stage.INFO);
    setCurrentPromptIndex(0);
    setPrompts([]);
    setAptitudeQuestions([]);
    setAptitudeAnswers([]);
    setAptitudeScore(0);
    setCandidateName("");
    setCandidatePosition("");
  };
  
  return (
    <div className="assessment-container min-h-screen py-12">
      {stage === Stage.INFO && (
        <AssessmentIntro 
          step="info" 
          candidateName={candidateName}
          candidatePosition={candidatePosition}
          onInfoSubmit={handleInfoSubmit} 
        />
      )}
      
      {stage === Stage.INTRO && (
        <AssessmentIntro 
          step="instructions" 
          candidateName={candidateName}
          onStart={handleStart} 
        />
      )}
      
      {stage === Stage.APTITUDE && aptitudeQuestions.length > 0 && (
        <AptitudeTest 
          questions={aptitudeQuestions}
          onComplete={handleAptitudeComplete}
          timeLimit={45 * 60} // 45 minutes in seconds
        />
      )}
      
      {stage === Stage.WRITING && prompts.length > 0 && (
        <WritingPrompt 
          prompt={prompts[currentPromptIndex].prompt}
          response={prompts[currentPromptIndex].response}
          timeLimit={30 * 60} // 30 minutes in seconds
          onSubmit={handlePromptSubmit}
          currentQuestion={currentPromptIndex + 1}
          totalQuestions={prompts.length}
        />
      )}
      
      {stage === Stage.COMPLETE && (
        <AssessmentComplete
          wordCount={prompts.reduce((total, prompt) => total + prompt.wordCount, 0)}
          candidateName={candidateName}
          candidatePosition={candidatePosition}
          restartAssessment={restartAssessment}
          completedPrompts={prompts}
          aptitudeScore={aptitudeScore}
          aptitudeTotal={aptitudeQuestions.length}
        />
      )}
    </div>
  );
};

export default Index;
