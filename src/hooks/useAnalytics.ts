
import { useState, useEffect } from "react";
import { getAllAssessments } from "@/firebase/services/assessment/assessmentQuery";
import { AssessmentData } from "@/types/assessment";
import { AnalyticsData, AnalyticsResult } from "@/types/analytics";
import { calculateAnalyticsData, getEmptyAnalyticsData } from "@/utils/analyticsCalculations";

export const useAnalytics = (): AnalyticsResult => {
  const [analytics, setAnalytics] = useState<AnalyticsData>(getEmptyAnalyticsData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const assessments = await getAllAssessments() as unknown as AssessmentData[];
        
        if (!assessments.length) {
          setLoading(false);
          return;
        }
        
        const analyticsData = calculateAnalyticsData(assessments);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error
  };
};
