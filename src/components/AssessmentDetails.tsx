
import React from "react";
import OptimizedAssessmentDetailsContainer from "@/components/assessment-details/OptimizedAssessmentDetailsContainer";

interface AssessmentDetailsProps {
  assessment: any;
  onBack: () => void;
  isGeneratingSummary?: boolean;
  refreshAssessment?: () => Promise<any>;
}

// This component now uses the optimized version with React.memo and performance improvements
const AssessmentDetails: React.FC<AssessmentDetailsProps> = (props) => {
  return <OptimizedAssessmentDetailsContainer {...props} />;
};

export default AssessmentDetails;
