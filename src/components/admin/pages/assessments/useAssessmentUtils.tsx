
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
        return "status-badge-active";
      case 'completed':
        return "status-badge-completed";
      case 'archived':
        return "status-badge-archived";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active':
        return <Clock className="h-4 w-4 text-green-500 dark:text-green-400 mr-1.5" />;
      case 'completed':
        return <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-1.5" />;
      case 'archived':
        return <AlertCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1.5" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number, total: number) => {
    if (!total) return "bg-gray-50 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400";
    const percentage = (score / total) * 100;
    
    if (percentage >= 80) return "score-badge-high";
    if (percentage >= 60) return "score-badge-medium";
    if (percentage >= 40) return "score-badge-low";
    return "score-badge-poor";
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
