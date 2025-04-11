
import { useState } from "react";
import AssessmentIntro from "@/components/AssessmentIntro";
import WritingPrompt from "@/components/WritingPrompt";
import AssessmentComplete from "@/components/AssessmentComplete";

// Assessment stages
enum Stage {
  INTRO,
  WRITING,
  COMPLETE
}

const Index = () => {
  const [stage, setStage] = useState<Stage>(Stage.INTRO);
  const [response, setResponse] = useState("");
  const [wordCount, setWordCount] = useState(0);
  
  // Sample writing prompts
  const prompts = [
    "Describe a situation where effective communication helped resolve a conflict in the workplace. What specific communication strategies were used, and why were they effective?",
    "Many companies are adopting remote work policies. Discuss the advantages and disadvantages of remote work from both an employer's and employee's perspective.",
    "Explain how technology has changed the way we communicate in professional settings. Include specific examples and discuss whether these changes have been positive or negative overall."
  ];
  
  // Randomly select one prompt
  const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  
  const handleStart = () => {
    setStage(Stage.WRITING);
  };
  
  const handleSubmit = (text: string) => {
    setResponse(text);
    // Count words
    const words = text.trim().split(/\s+/).filter(word => word !== "");
    setWordCount(words.length);
    setStage(Stage.COMPLETE);
  };
  
  const restartAssessment = () => {
    setStage(Stage.INTRO);
    setResponse("");
    setWordCount(0);
  };
  
  return (
    <div className="assessment-container min-h-screen py-12">
      {stage === Stage.INTRO && (
        <AssessmentIntro onStart={handleStart} />
      )}
      
      {stage === Stage.WRITING && (
        <WritingPrompt 
          prompt={selectedPrompt}
          timeLimit={30 * 60} // 30 minutes in seconds
          onSubmit={handleSubmit}
        />
      )}
      
      {stage === Stage.COMPLETE && (
        <AssessmentComplete
          wordCount={wordCount}
          restartAssessment={restartAssessment}
        />
      )}
    </div>
  );
};

export default Index;
