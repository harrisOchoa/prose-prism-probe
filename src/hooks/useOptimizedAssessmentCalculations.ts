
import { useMemo, useCallback } from "react";

export interface AssessmentCalculationsProps {
  aptitudeScore: number;
  aptitudeTotal: number;
  overallWritingScore?: number;
  wordCount?: number;
}

export const useOptimizedAssessmentCalculations = (assessmentData: AssessmentCalculationsProps) => {
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

  // Memoize percentage calculations as functions
  const getAptitudeScorePercentage = useCallback(() => {
    if (!assessmentData.aptitudeTotal) return 0;
    return Math.round((assessmentData.aptitudeScore / assessmentData.aptitudeTotal) * 100);
  }, [assessmentData.aptitudeScore, assessmentData.aptitudeTotal]);

  const getWritingScorePercentage = useCallback(() => {
    if (!assessmentData.overallWritingScore) return 0;
    return Math.round((assessmentData.overallWritingScore / 5) * 100);
  }, [assessmentData.overallWritingScore]);

  const getOverallScore = useCallback(() => {
    const aptitudePercentage = getAptitudeScorePercentage();
    const writingPercentage = getWritingScorePercentage();
    
    if (!assessmentData.overallWritingScore) {
      return aptitudePercentage;
    }
    
    return Math.round((aptitudePercentage + writingPercentage) / 2);
  }, [getAptitudeScorePercentage, getWritingScorePercentage, assessmentData.overallWritingScore]);

  const getProgressColor = useCallback((value: number) => {
    if (value >= 70) return "#22c55e"; // green
    if (value >= 50) return "#eab308"; // yellow
    return "#ef4444"; // red
  }, []);

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
