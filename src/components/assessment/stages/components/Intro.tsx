
import React from "react";
import AssessmentIntro from "@/components/AssessmentIntro";

interface IntroProps {
  candidateName: string;
  onStart: () => void;
}

const Intro: React.FC<IntroProps> = ({ candidateName, onStart }) => {
  return (
    <AssessmentIntro 
      step="instructions" 
      candidateName={candidateName}
      onStart={onStart}
    />
  );
};

export default Intro;
