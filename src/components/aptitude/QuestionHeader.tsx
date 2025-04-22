
import React from "react";

interface QuestionHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
}

const QuestionHeader = ({ currentQuestion, totalQuestions }: QuestionHeaderProps) => {
  return (
    <div className="flex items-center mb-4 text-sm font-medium text-assessment-accent">
      <span className="bg-assessment-accent/10 rounded-full px-3 py-1">
        Question {currentQuestion} of {totalQuestions}
      </span>
    </div>
  );
};

export default QuestionHeader;
