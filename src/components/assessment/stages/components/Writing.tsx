
import React from "react";
import WritingPrompt from "@/components/WritingPrompt";

interface WritingProps {
  prompt: string;
  response: string;
  onSubmit: (text: string) => void;
  currentQuestion: number;
  totalQuestions: number;
  isLoading: boolean;
}

const Writing: React.FC<WritingProps> = ({ 
  prompt, 
  response, 
  onSubmit, 
  currentQuestion, 
  totalQuestions, 
  isLoading 
}) => {
  return (
    <WritingPrompt 
      prompt={prompt}
      response={response}
      timeLimit={30 * 60}
      onSubmit={onSubmit}
      currentQuestion={currentQuestion}
      totalQuestions={totalQuestions}
      isLoading={isLoading}
    />
  );
};

export default Writing;
