
import { AssessmentData } from "@/types/assessment";

export interface AssessmentTableProps {
  assessments: AssessmentData[];
  currentPage: number;
  totalPages: number;
  handlePageChange: (pageNumber: number) => void;
  viewAssessmentDetails: (assessment: AssessmentData) => void;
  getScoreColor: (score: number) => string;
  loading?: boolean;
  hasNextPage?: boolean;
}

export const getAptitudeScoreColor = (score: number, total: number): string => {
  if (!score || !total) return "bg-gray-300";
  
  const percentage = (score / total) * 100;
  
  if (percentage >= 85) return "bg-green-500";
  if (percentage >= 70) return "bg-green-400";
  if (percentage >= 60) return "bg-yellow-500";
  if (percentage >= 40) return "bg-orange-500";
  return "bg-red-500";
};
