
import React from "react";
import { AssessmentManagerProps } from "./types";
import { useAssessmentState } from "./hooks/useAssessmentState";

const AssessmentManager = ({ children }: AssessmentManagerProps) => {
  const assessmentState = useAssessmentState();
  
  return <>{children(assessmentState)}</>;
};

export default AssessmentManager;
