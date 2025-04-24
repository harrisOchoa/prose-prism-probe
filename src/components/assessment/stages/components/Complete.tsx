
import React from "react";
import AssessmentComplete from "@/components/AssessmentComplete";
import { WritingPromptItem } from "@/components/AssessmentManager";

interface CompleteProps {
  candidateName: string;
  candidatePosition: string;
  prompts: WritingPromptItem[];
  aptitudeScore: number;
  aptitudeTotal: number;
  restartAssessment: () => void;
  antiCheatingMetrics?: any;
}

const Complete: React.FC<CompleteProps> = ({ 
  candidateName,
  candidatePosition,
  prompts,
  aptitudeScore,
  aptitudeTotal,
  restartAssessment,
  antiCheatingMetrics
}) => {
  return (
    <AssessmentComplete
      wordCount={prompts.reduce((total, prompt) => total + prompt.wordCount, 0)}
      candidateName={candidateName}
      candidatePosition={candidatePosition}
      restartAssessment={restartAssessment}
      completedPrompts={prompts}
      aptitudeScore={aptitudeScore}
      aptitudeTotal={aptitudeTotal}
      antiCheatingMetrics={antiCheatingMetrics}
    />
  );
};

export default Complete;
