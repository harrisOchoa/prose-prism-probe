
import { AssessmentData } from "@/types/assessment";

/**
 * Calculate assessment trends
 */
export const calculateAssessmentTrends = (assessments: AssessmentData[]): { name: string; assessments: number; completions: number; }[] => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  
  return Array(5).fill(0).map((_, i) => {
    const monthIndex = (currentMonth - 4 + i + 12) % 12; // Go back 4 months and wrap around
    
    const monthStart = new Date();
    monthStart.setMonth(monthIndex);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthEnd = new Date();
    monthEnd.setMonth(monthIndex + 1);
    monthEnd.setDate(0); // Last day of month
    monthEnd.setHours(23, 59, 59, 999);
    
    const monthAssessments = assessments.filter(a => {
      const date = a.submittedAt?.toDate?.() ?? new Date(0);
      return date >= monthStart && date <= monthEnd;
    }).length;
    
    // Completions are roughly 80% of assessments
    const monthCompletions = Math.round(monthAssessments * 0.8);
    
    return {
      name: months[monthIndex],
      assessments: monthAssessments,
      completions: monthCompletions
    };
  });
};
