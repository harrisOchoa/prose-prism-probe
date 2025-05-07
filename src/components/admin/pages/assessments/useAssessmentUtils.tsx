
import { useState } from "react";
import { Clock, FileText, AlertCircle } from "lucide-react";

export const useAssessmentUtils = () => {
  // State for the dialog
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Dialog functions
  const openAssessmentDetails = (assessment: any) => {
    setSelectedAssessment(assessment);
    setIsDialogOpen(true);
  };

  const closeAssessmentDetails = () => {
    setIsDialogOpen(false);
  };

  // Status styling functions
  const getBadgeStyle = (status: string) => {
    switch(status) {
      case 'active':
        return "bg-green-50 text-green-700 border-green-200";
      case 'completed':
        return "bg-blue-50 text-blue-700 border-blue-200";
      case 'archived':
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active':
        return <Clock className="h-4 w-4 text-green-500 mr-1.5" />;
      case 'completed':
        return <FileText className="h-4 w-4 text-blue-500 mr-1.5" />;
      case 'archived':
        return <AlertCircle className="h-4 w-4 text-gray-500 mr-1.5" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number, total: number) => {
    if (!total) return "bg-gray-50 text-gray-700";
    const percentage = (score / total) * 100;
    
    if (percentage >= 80) return "bg-green-50 text-green-700";
    if (percentage >= 60) return "bg-blue-50 text-blue-700";
    if (percentage >= 40) return "bg-yellow-50 text-yellow-700";
    return "bg-red-50 text-red-700";
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
