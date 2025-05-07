
import { AssessmentData } from "@/types/assessment";
import { AnalyticsData } from "@/types/analytics";
import { calculateMonthlyGrowth } from "./analytics/monthlyGrowth";
import { calculateCategoryPerformance } from "./analytics/categoryPerformance";
import { generateRecentActivity } from "./analytics/recentActivity";
import { calculateAssessmentTrends } from "./analytics/assessmentTrends";
import { calculateAverageCompletionTime, getEmptyAnalyticsData } from "./analytics/baseCalculations";

/**
 * Calculate analytics data from assessment data
 */
export const calculateAnalyticsData = (assessments: AssessmentData[]): AnalyticsData => {
  if (!assessments.length) {
    return getEmptyAnalyticsData();
  }
  
  // Calculate completion rate (based on whether analysis is completed)
  const completedCount = assessments.filter(a => a.analysisStatus === 'completed').length;
  const completionRate = Math.round((completedCount / assessments.length) * 100);
  
  // Calculate total assessments
  const totalAssessments = assessments.length;
  
  // Calculate monthly growth
  const monthlyGrowth = calculateMonthlyGrowth(assessments);
  
  // Average completion time (this is an estimate as we don't have actual time spent data)
  const averageCompletionTime = calculateAverageCompletionTime();
  
  // Generate category performance data from aptitude categories
  const categoryPerformance = calculateCategoryPerformance(assessments);
  
  // Recent activity
  const recentActivity = generateRecentActivity(assessments);
  
  // Assessment trends
  const assessmentTrends = calculateAssessmentTrends(assessments);
  
  return {
    completionRate,
    averageCompletionTime,
    totalAssessments,
    monthlyGrowth,
    categoryPerformance,
    recentActivity,
    assessmentTrends
  };
};

// Re-export utility functions from their respective modules
export { getEmptyAnalyticsData } from "./analytics/baseCalculations";
export { calculateMonthlyGrowth } from "./analytics/monthlyGrowth";
export { calculateCategoryPerformance } from "./analytics/categoryPerformance";
export { generateRecentActivity } from "./analytics/recentActivity";
export { calculateAssessmentTrends } from "./analytics/assessmentTrends";
export { calculateAverageCompletionTime } from "./analytics/baseCalculations";

