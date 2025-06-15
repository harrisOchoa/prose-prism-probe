
import { useMemo } from 'react';
import { StrictAssessmentData } from '@/types/optimized';

export const useStrictAssessmentCalculations = (assessmentData: StrictAssessmentData) => {
  // Memoized calculations to prevent unnecessary recalculations
  const calculations = useMemo(() => {
    const getAptitudeScorePercentage = (): number => {
      if (!assessmentData.aptitudeTotal || assessmentData.aptitudeTotal === 0) return 0;
      return Math.round((assessmentData.aptitudeScore / assessmentData.aptitudeTotal) * 100);
    };

    const getWritingScorePercentage = (): number => {
      if (!assessmentData.writingScores || assessmentData.writingScores.length === 0) return 0;
      
      const validScores = assessmentData.writingScores.filter(score => score.score > 0);
      if (validScores.length === 0) return 0;
      
      const totalScore = validScores.reduce((sum, score) => sum + score.score, 0);
      const averageScore = totalScore / validScores.length;
      return Math.round((averageScore / 10) * 100); // Assuming scores are out of 10
    };

    const getOverallScore = (): number => {
      const aptitudePercentage = getAptitudeScorePercentage();
      const writingPercentage = getWritingScorePercentage();
      
      if (aptitudePercentage === 0 && writingPercentage === 0) return 0;
      if (aptitudePercentage === 0) return writingPercentage;
      if (writingPercentage === 0) return aptitudePercentage;
      
      return Math.round((aptitudePercentage + writingPercentage) / 2);
    };

    const getProgressColor = (value: number): string => {
      if (value >= 80) return "text-green-600";
      if (value >= 60) return "text-blue-600";
      if (value >= 40) return "text-yellow-600";
      return "text-red-600";
    };

    const getScoreColor = (score: number): string => {
      if (score >= 8) return "text-green-600";
      if (score >= 6) return "text-blue-600";
      if (score >= 4) return "text-yellow-600";
      return "text-red-600";
    };

    const getScoreBgColor = (score: number): string => {
      if (score >= 8) return "bg-green-50";
      if (score >= 6) return "bg-blue-50";
      if (score >= 4) return "bg-yellow-50";
      return "bg-red-50";
    };

    const getScoreLabel = (score: number): string => {
      if (score >= 8) return "Excellent";
      if (score >= 6) return "Good";
      if (score >= 4) return "Fair";
      return "Needs Improvement";
    };

    return {
      getAptitudeScorePercentage,
      getWritingScorePercentage,
      getOverallScore,
      getProgressColor,
      getScoreColor,
      getScoreBgColor,
      getScoreLabel
    };
  }, [
    assessmentData.aptitudeScore,
    assessmentData.aptitudeTotal,
    assessmentData.writingScores,
    assessmentData.overallWritingScore
  ]);

  return calculations;
};
