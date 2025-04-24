
import React from "react";
import AssessmentIntro from "@/components/AssessmentIntro";

interface InfoProps {
  candidateName: string;
  candidatePosition: string;
  onInfoSubmit: (name: string, position: string, skills: string) => void;
}

const Info: React.FC<InfoProps> = ({ candidateName, candidatePosition, onInfoSubmit }) => {
  return (
    <AssessmentIntro 
      step="info" 
      candidateName={candidateName}
      candidatePosition={candidatePosition}
      onInfoSubmit={onInfoSubmit}
    />
  );
};

export default Info;
