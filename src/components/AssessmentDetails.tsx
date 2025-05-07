
import React from "react";
import AssessmentDetailsContainer from "@/components/assessment-details";

interface AssessmentDetailsProps {
  assessment: any;
  onBack: () => void;
  isGeneratingSummary?: boolean;
  refreshAssessment?: () => Promise<any>;
}

// This component is now just a wrapper around the refactored components
const AssessmentDetails: React.FC<AssessmentDetailsProps> = (props) => {
  return <AssessmentDetailsContainer {...props} />;
};

export default AssessmentDetails;
