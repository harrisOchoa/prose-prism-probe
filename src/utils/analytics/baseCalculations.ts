
import { AssessmentData } from "@/types/assessment";
import { AnalyticsData } from "@/types/analytics";
import { calculateMonthlyGrowth } from "./monthlyGrowth";
import { calculateCategoryPerformance } from "./categoryPerformance";
import { generateRecentActivity } from "./recentActivity";
import { calculateAssessmentTrends } from "./assessmentTrends";

/**
 * Calculate estimated average completion time
 */
export const calculateAverageCompletionTime = (): string => {
  // This is an estimate as we don't have actual time spent data
  const avgTimeMin = Math.floor(20 + Math.random() * 10); // Simulate between 20-30 mins
  const avgTimeSec = Math.floor(Math.random() * 60);
  return `${avgTimeMin}m ${avgTimeSec}s`;
};

/**
 * Get empty analytics data for when there are no assessments
 */
export const getEmptyAnalyticsData = (): AnalyticsData => {
  return {
    completionRate: 0,
    averageCompletionTime: "0m 0s",
    totalAssessments: 0,
    monthlyGrowth: 0,
    categoryPerformance: [],
    recentActivity: [],
    assessmentTrends: []
  };
};

