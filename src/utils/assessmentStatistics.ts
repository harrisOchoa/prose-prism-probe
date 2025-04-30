
import { AssessmentData } from "@/types/assessment";

export const calculateAssessmentStatistics = (assessments: AssessmentData[]) => {
  if (assessments.length === 0) {
    return {
      totalAssessments: 0,
      averageAptitudeScore: "0",
      averageWordCount: 0,
      averageWritingScore: "0"
    };
  }

  const totalAssessments = assessments.length;
  
  const averageAptitudeScore = (assessments.reduce((sum, assessment) => 
    sum + (assessment.aptitudeScore / (assessment.aptitudeTotal || 30) * 100), 0) / assessments.length)
    .toFixed(1);
  
  const averageWordCount = Math.round(
    assessments.reduce((sum, assessment) => sum + assessment.wordCount, 0) / assessments.length
  );
  
  const assessmentsWithWritingScore = assessments.filter(a => a.overallWritingScore);
  const averageWritingScore = assessmentsWithWritingScore.length > 0 
    ? (assessments.reduce((sum, assessment) => sum + (assessment.overallWritingScore || 0), 0) / 
       assessmentsWithWritingScore.length).toFixed(1)
    : "0";

  return {
    totalAssessments,
    averageAptitudeScore,
    averageWordCount,
    averageWritingScore
  };
};

export const getScoreColor = (score: number) => {
  if (score >= 4.5) return "text-green-600 font-semibold";
  if (score >= 3.5) return "text-blue-600 font-semibold";
  if (score >= 2.5) return "text-yellow-600 font-semibold";
  if (score >= 1.5) return "text-orange-600 font-semibold";
  return "text-red-600 font-semibold";
};
