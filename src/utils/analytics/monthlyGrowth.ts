
import { AssessmentData } from "@/types/assessment";

/**
 * Calculate monthly growth percentage
 */
export const calculateMonthlyGrowth = (assessments: AssessmentData[]): number => {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const thisMonth = assessments.filter(a => {
    const date = a.submittedAt?.toDate?.() ?? new Date(0);
    return date > lastMonth;
  }).length;
  
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  
  const lastMonthCount = assessments.filter(a => {
    const date = a.submittedAt?.toDate?.() ?? new Date(0);
    return date > twoMonthsAgo && date <= lastMonth;
  }).length;
  
  let monthlyGrowth = 0;
  if (lastMonthCount > 0) {
    monthlyGrowth = Math.round(((thisMonth - lastMonthCount) / lastMonthCount) * 100);
  } else if (thisMonth > 0) {
    monthlyGrowth = 100; // If there were 0 last month and some this month, that's 100% growth
  }
  
  return monthlyGrowth;
};
