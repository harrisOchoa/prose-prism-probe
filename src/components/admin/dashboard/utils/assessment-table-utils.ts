
import { AssessmentData } from "@/types/assessment";

export const getAptitudeScoreColor = (score: number, total: number) => {
  const percentage = (score / total) * 100;
  if (percentage >= 80) return "bg-green-500";
  if (percentage >= 60) return "bg-blue-500";
  if (percentage >= 40) return "bg-yellow-500";
  if (percentage >= 20) return "bg-orange-500";
  return "bg-red-500";
};

export interface AssessmentTableProps {
  assessments: AssessmentData[];
  currentPage: number;
  totalPages: number;
  handlePageChange: (pageNumber: number) => void;
  viewAssessmentDetails: (assessment: AssessmentData) => void;
  getScoreColor: (score: number) => string;
}
