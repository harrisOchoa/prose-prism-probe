import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import AssessmentTimer from "./AssessmentTimer";
import { toast } from "@/components/ui/use-toast";
import { useAntiCheating } from "@/hooks/useAntiCheating";

interface WritingPromptProps {
  prompt: string;
  response: string;
  timeLimit: number; // in seconds
  onSubmit: (response: string) => void;
  currentQuestion: number;
  totalQuestions: number;
}

const WritingPrompt = ({ 
  prompt, 
  response: initialResponse, 
  timeLimit, 
  onSubmit, 
  currentQuestion, 
  totalQuestions 
}: WritingPromptProps) => {
  const [response, setResponse] = useState(initialResponse);
  const [wordCount, setWordCount] = useState(0);
  
  const {
    handleKeyPress,
    preventCopyPaste,
    getAssessmentMetrics,
    tabSwitches,
    suspiciousActivity,
  } = useAntiCheating(response);
  
  useEffect(() => {
    setResponse(initialResponse);
    // Count words for initial response (if any)
    const words = initialResponse.trim().split(/\s+/).filter(word => word !== "");
    setWordCount(words.length);
  }, [initialResponse, prompt]);
  
  const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setResponse(text);
    
    // Count words (split by spaces and filter out empty strings)
    const words = text.trim().split(/\s+/).filter(word => word !== "");
    setWordCount(words.length);
  };
  
  const handleSubmit = () => {
    if (wordCount < 50) {
      toast({
        title: "Response too short",
        description: "Please write at least 50 words to submit your assessment.",
        variant: "destructive",
      });
      return;
    }
    
    // Include anti-cheating metrics with the submission
    const metrics = getAssessmentMetrics();
    onSubmit(response);
    
    // Log suspicious activity
    if (metrics.suspiciousActivity || metrics.tabSwitches > 3) {
      console.warn("Suspicious activity detected:", metrics);
    }
  };
  
  const handleTimeEnd = () => {
    toast({
      title: "Time's up!",
      description: "Your response has been automatically submitted.",
    });
    onSubmit(response);
  };
  
  return (
    <div className="assessment-card max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="assessment-title">Writing Assessment</h1>
        <AssessmentTimer duration={timeLimit} onTimeEnd={handleTimeEnd} />
      </div>
      
      <div className="flex items-center mb-4 text-sm font-medium text-assessment-accent">
        <span className="bg-assessment-accent/10 rounded-full px-3 py-1">
          Question {currentQuestion} of {totalQuestions}
        </span>
      </div>
      
      <div className="bg-assessment-muted p-6 rounded-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Writing Prompt:</h2>
        <p className="text-gray-700">{prompt}</p>
      </div>
      
      <div className="mb-6">
        <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
          Your Response:
        </label>
        <Textarea 
          id="response"
          className="assessment-textarea min-h-[300px]"
          placeholder="Start writing your response here..."
          value={response}
          onChange={handleResponseChange}
          onKeyPress={handleKeyPress}
          onCopy={preventCopyPaste}
          onPaste={preventCopyPaste}
          onCut={preventCopyPaste}
          onContextMenu={(e) => e.preventDefault()}
        />
        <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
          <span>{wordCount} words</span>
          <span>{response.length} characters</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Aim for 300-500 words to fully demonstrate your writing abilities.
        </p>
        <Button 
          className="assessment-button"
          onClick={handleSubmit}
        >
          {currentQuestion < totalQuestions ? `Continue to Next Question` : `Complete Assessment`}
        </Button>
      </div>
    </div>
  );
};

export default WritingPrompt;
