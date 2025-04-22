
import React from "react";
import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
}

const NavigationButtons = ({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
}: NavigationButtonsProps) => {
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentQuestion === 0}
      >
        Previous
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          {currentQuestion + 1} of {totalQuestions}
        </span>
      </div>

      <Button onClick={onNext}>
        {currentQuestion < totalQuestions - 1 ? "Next" : "Submit Test"}
      </Button>
    </div>
  );
};

export default NavigationButtons;
