
import { useState, useEffect } from "react";
import AssessmentIntro from "@/components/AssessmentIntro";
import WritingPrompt from "@/components/WritingPrompt";
import AssessmentComplete from "@/components/AssessmentComplete";
import { getRandomQuestions, WritingPromptQuestion } from "@/utils/questionBank";

// Assessment stages
enum Stage {
  INFO,
  INTRO,
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

const Index = () => {
  const [stage, setStage] = useState<Stage>(Stage.INFO);
  const [candidateName, setCandidateName] = useState("");
  const [candidatePosition, setCandidatePosition] = useState("");
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  
  // State for storing the selected prompts
  const [prompts, setPrompts] = useState<WritingPromptItem[]>([]);
  
  // Initialize with random questions when candidate info is submitted
  const handleInfoSubmit = (name: string, position: string) => {
    setCandidateName(name);
    setCandidatePosition(position);
    
    // Get random questions and initialize them with empty responses
    const selectedQuestions = getRandomQuestions(QUESTIONS_PER_ASSESSMENT);
    const initialPrompts: WritingPromptItem[] = selectedQuestions.map(question => ({
      ...question,
      response: "",
      wordCount: 0
    }));
    
    setPrompts(initialPrompts);
    setStage(Stage.INTRO);
  };
  
  const handleStart = () => {
    setStage(Stage.WRITING);
    setCurrentPromptIndex(0);
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
        />
      )}
    </div>
  );
};

export default Index;
