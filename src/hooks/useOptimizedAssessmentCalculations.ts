
import { useMemo, useCallback } from "react";

export interface AssessmentCalculationsProps {
  aptitudeScore: number;
  aptitudeTotal: number;
  overallWritingScore?: number;
  wordCount?: number;
}

export const useOptimizedAssessmentCalculations = (assessmentData: AssessmentCalculationsProps | null | undefined) => {
  // Provide safe defaults when assessmentData is null or undefined
  const safeAssessmentData = useMemo(() => {
    if (!assessmentData) {
      return {
        aptitudeScore: 0,
        aptitudeTotal: 0,
        overallWritingScore: 0,
        wordCount: 0
      };
    }
    
    return {
      aptitudeScore: assessmentData.aptitudeScore || 0,
      aptitudeTotal: assessmentData.aptitudeTotal || 0,
      overallWritingScore: assessmentData.overallWritingScore || 0,
      wordCount: assessmentData.wordCount || 0
    };
  }, [assessmentData]);

  // Memoize score color calculations
  const getScoreColor = useCallback((score: number) => {
    if (score === 0) return "text-gray-600";
    if (score >= 4.5) return "text-green-600";
    if (score >= 3.5) return "text-blue-600";
    if (score >= 2.5) return "text-yellow-600";
    if (score >= 1.5) return "text-orange-600";
    return "text-red-600";
  }, []);

  const getScoreBgColor = useCallback((score: number) => {
    if (score === 0) return "bg-gray-100";
    if (score >= 4.5) return "bg-green-50";
    if (score >= 3.5) return "bg-blue-50";
    if (score >= 2.5) return "bg-yellow-50";
    if (score >= 1.5) return "bg-orange-50";
    return "bg-red-50";
  }, []);

  const getScoreLabel = useCallback((score: number) => {
    if (score === 0) return "Not Evaluated";
    if (score >= 4.5) return "Exceptional";
    if (score >= 3.5) return "Proficient";
    if (score >= 2.5) return "Satisfactory";
    if (score >= 1.5) return "Basic";
    return "Needs Improvement";
  }, []);

  // Memoize percentage calculations as functions with safe defaults
  const getAptitudeScorePercentage = useCallback(() => {
    if (!safeAssessmentData.aptitudeTotal || safeAssessmentData.aptitudeTotal === 0) return 0;
    return Math.round((safeAssessmentData.aptitudeScore / safeAssessmentData.aptitudeTotal) * 100);
  }, [safeAssessmentData.aptitudeScore, safeAssessmentData.aptitudeTotal]);

  const getWritingScorePercentage = useCallback(() => {
    if (!safeAssessmentData.overallWritingScore || safeAssessmentData.overallWritingScore === 0) return 0;
    return Math.round((safeAssessmentData.overallWritingScore / 5) * 100);
  }, [safeAssessmentData.overallWritingScore]);

  const getOverallScore = useCallback(() => {
    const aptitudePercentage = getAptitudeScorePercentage();
    const writingPercentage = getWritingScorePercentage();
    
    if (!safeAssessmentData.overallWritingScore || safeAssessmentData.overallWritingScore === 0) {
      return aptitudePercentage;
    }
    
    return Math.round((aptitudePercentage + writingPercentage) / 2);
  }, [getAptitudeScorePercentage, getWritingScorePercentage, safeAssessmentData.overallWritingScore]);

  const getProgressColor = useCallback((value: number) => {
    if (value >= 70) return "#22c55e"; // green
    if (value >= 50) return "#eab308"; // yellow
    return "#ef4444"; // red
  }, []);

  // Add debugging when data is null
  if (!assessmentData) {
    console.log("Assessment data is null in useOptimizedAssessmentCalculations");
  }

  return {
    getScoreColor,
    getScoreBgColor,
    getScoreLabel,
    getAptitudeScorePercentage,
    getWritingScorePercentage,
    getOverallScore,
    getProgressColor
  };
};
