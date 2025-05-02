
import React from "react";
import { CardTitle } from "@/components/ui/card";
import AssessmentTimer from "@/components/AssessmentTimer";
import ProgressIndicator from "@/components/assessment/ProgressIndicator";
import { useIsMobile } from "@/hooks/use-mobile";

interface WritingHeaderProps {
  timeLimit: number;
  onTimeEnd: () => void;
  currentQuestion: number;
  totalQuestions: number;
}

const WritingHeader: React.FC<WritingHeaderProps> = ({
  timeLimit,
  onTimeEnd,
  currentQuestion,
  totalQuestions
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <CardTitle className={`${isMobile ? 'text-lg' : 'text-2xl'}`}>
          Writing Assessment
        </CardTitle>
        <AssessmentTimer duration={timeLimit} onTimeEnd={onTimeEnd} />
      </div>
      <ProgressIndicator 
        currentStep={currentQuestion} 
        totalSteps={totalQuestions}
        label="Writing Progress"
      />
    </div>
  );
};

export default WritingHeader;
