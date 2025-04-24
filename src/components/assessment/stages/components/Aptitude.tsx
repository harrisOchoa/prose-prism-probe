
import React from "react";
import AptitudeTest from "@/components/AptitudeTest";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

interface AptitudeProps {
  questions: any[];
  onComplete: (answers: number[], score: number, metrics?: AntiCheatingMetrics) => void;
}

const Aptitude: React.FC<AptitudeProps> = ({ questions, onComplete }) => {
  return (
    <AptitudeTest 
      questions={questions}
      onComplete={onComplete}
      timeLimit={30 * 60}
    />
  );
};

export default Aptitude;
