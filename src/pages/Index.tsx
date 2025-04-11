
import { useState, useEffect } from "react";
import AssessmentIntro from "@/components/AssessmentIntro";
import WritingPrompt from "@/components/WritingPrompt";
import AssessmentComplete from "@/components/AssessmentComplete";
import AptitudeTest from "@/components/AptitudeTest";
import { getRandomQuestions, WritingPromptQuestion } from "@/utils/questionBank";
import { getRandomAptitudeQuestions, AptitudeQuestion } from "@/utils/aptitudeQuestions";

// Assessment stages
enum Stage {
  LANDING,  // New landing stage
  INFO,     // Name/position collection
  INTRO,    // Instructions
  APTITUDE, // Aptitude test
  WRITING,  // Writing assessment
  COMPLETE  // Thank you page
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
  
  return (
    <div className="assessment-container min-h-screen py-12">
      {stage === Stage.LANDING && (
        <div className="assessment-card max-w-4xl mx-auto text-center">
          <h1 className="assessment-title text-center text-assessment-accent mb-6">Candidate Assessment Platform</h1>
          <div className="bg-assessment-muted p-6 rounded-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Welcome to our Assessment Platform</h2>
            <p className="mb-6">
              This platform will guide you through a comprehensive assessment process consisting of:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-assessment-primary mb-2">Aptitude Test</h3>
                <p className="text-gray-700">A 25-question assessment to evaluate your critical thinking skills</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-assessment-primary mb-2">Writing Assessment</h3>
                <p className="text-gray-700">A series of writing prompts to showcase your communication abilities</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              The entire assessment will take approximately 75 minutes to complete. Please ensure you have a quiet environment 
              and uninterrupted time before beginning.
            </p>
          </div>
          <div className="text-center">
            <button 
              className="assessment-button text-lg px-8 py-4"
              onClick={startAssessment}
            >
              Start Assessment
            </button>
          </div>
        </div>
      )}
      
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
