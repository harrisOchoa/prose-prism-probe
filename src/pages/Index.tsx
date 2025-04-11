
import { useState } from "react";
import AssessmentIntro from "@/components/AssessmentIntro";
import WritingPrompt from "@/components/WritingPrompt";
import AssessmentComplete from "@/components/AssessmentComplete";

// Assessment stages
enum Stage {
  INFO,
  INTRO,
  WRITING,
  COMPLETE
}

// Define the type for a writing prompt
interface WritingPromptItem {
  id: number;
  prompt: string;
  response: string;
  wordCount: number;
}

const Index = () => {
  const [stage, setStage] = useState<Stage>(Stage.INFO);
  const [candidateName, setCandidateName] = useState("");
  const [candidatePosition, setCandidatePosition] = useState("");
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  
  // Sample writing prompts with initial empty responses
  const [prompts, setPrompts] = useState<WritingPromptItem[]>([
    {
      id: 1,
      prompt: "Describe a situation where effective communication helped resolve a conflict in the workplace. What specific communication strategies were used, and why were they effective?",
      response: "",
      wordCount: 0
    },
    {
      id: 2,
      prompt: "Many companies are adopting remote work policies. Discuss the advantages and disadvantages of remote work from both an employer's and employee's perspective.",
      response: "",
      wordCount: 0
    },
    {
      id: 3,
      prompt: "Explain how technology has changed the way we communicate in professional settings. Include specific examples and discuss whether these changes have been positive or negative overall.",
      response: "",
      wordCount: 0
    }
  ]);
  
  const handleInfoSubmit = (name: string, position: string) => {
    setCandidateName(name);
    setCandidatePosition(position);
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
    setPrompts(prompts.map(prompt => ({ ...prompt, response: "", wordCount: 0 })));
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
      
      {stage === Stage.WRITING && (
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
