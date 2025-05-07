
import { AssessmentData } from "@/types/assessment";

export interface AnalyticsData {
  completionRate: number;
  averageCompletionTime: string;
  totalAssessments: number;
  monthlyGrowth: number;
  categoryPerformance: {
    name: string;
    percentage: number;
  }[];
  recentActivity: {
    type: string;
    description: string;
    position: string;
    time: string;
    color: string;
  }[];
  assessmentTrends: {
    name: string;
    assessments: number;
    completions: number;
  }[];
}

export interface AnalyticsResult {
  analytics: AnalyticsData;
  loading: boolean;
  error: string | null;
}
