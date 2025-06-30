
import { useState } from "react";

export const useAssessmentUtils = () => {
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openAssessmentDetails = (assessment: any) => {
    console.log("Opening assessment details for:", {
      assessmentId: assessment?.id,
      assessmentName: assessment?.candidateName,
      hasAssessment: !!assessment
    });
    
    // Make sure we have valid assessment data
    if (!assessment) {
      console.error("Cannot open assessment details - no assessment data provided");
      return;
    }
    
    setSelectedAssessment(assessment);
    setIsDialogOpen(true);
  };

  const closeAssessmentDetails = () => {
    console.log("Closing assessment details dialog");
    setIsDialogOpen(false);
    // Don't clear selectedAssessment immediately to prevent flash
    setTimeout(() => {
      setSelectedAssessment(null);
    }, 300);
  };

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    // Return appropriate icon based on status
    return null; // Placeholder - implement based on your needs
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return {
    selectedAssessment,
    isDialogOpen,
    openAssessmentDetails,
    closeAssessmentDetails,
    getBadgeStyle,
    getStatusIcon,
    getScoreColor
  };
};
