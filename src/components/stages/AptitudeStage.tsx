
import React from "react";
import AptitudeTest from "@/components/AptitudeTest";
import { AptitudeQuestion } from "@/utils/aptitudeQuestions";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";
import { Stage } from "@/components/AssessmentManager";

interface AptitudeStageProps {
  aptitudeQuestions: AptitudeQuestion[];
  handleStageTransition: (newStage: Stage) => void;
  handleAptitudeComplete: (answers: number[], score: number, metrics?: AntiCheatingMetrics) => void;
}

const AptitudeStage: React.FC<AptitudeStageProps> = ({
  aptitudeQuestions, 
  handleStageTransition, 
  handleAptitudeComplete
}) => {
  const onComplete = (answers: number[], score: number, metrics?: AntiCheatingMetrics) => {
    console.log("Aptitude test completed with score:", score, "out of", aptitudeQuestions.length);
    handleStageTransition(Stage.SELECT_PROMPTS);
    handleAptitudeComplete(answers, score, metrics);
  };

  return (
    <AptitudeTest 
      questions={aptitudeQuestions}
      onComplete={onComplete}
      timeLimit={30 * 60} // 30 minutes in seconds
    />
  );
};

export default AptitudeStage;
