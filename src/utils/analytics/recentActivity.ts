
import { AssessmentData } from "@/types/assessment";

/**
 * Generate recent activity data
 */
export const generateRecentActivity = (assessments: AssessmentData[]): { type: string; description: string; position: string; time: string; color: string; }[] => {
  return assessments
    .sort((a, b) => {
      const dateA = a.submittedAt?.toDate?.() ?? new Date(0);
      const dateB = b.submittedAt?.toDate?.() ?? new Date(0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 4)
    .map((assessment, index) => {
      const submittedDate = assessment.submittedAt?.toDate?.() ?? new Date();
      const hours = Math.floor((new Date().getTime() - submittedDate.getTime()) / (60 * 60 * 1000));
      const days = Math.floor(hours / 24);
      
      let time = "";
      if (days > 0) {
        time = `${days} day${days > 1 ? 's' : ''} ago`;
      } else {
        time = `${hours} hour${hours > 1 || hours === 0 ? 's' : ''} ago`;
      }
      
      const colors = ["blue-500", "green-500", "purple-500", "orange-500"];
      
      return {
        type: "completion",
        description: `${assessment.candidateName} completed assessment`,
        position: `${assessment.candidatePosition}`,
        time,
        color: colors[index]
      };
    });
};
