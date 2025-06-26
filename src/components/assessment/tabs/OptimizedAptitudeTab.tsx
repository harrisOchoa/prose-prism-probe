
import React, { memo } from 'react';
import { StrictAssessmentData } from "@/types/optimized";
import { shallowEqual } from "@/utils/shallowCompare";
import ScoreDisplay from './aptitude/ScoreDisplay';
import TimeAnalysis from './aptitude/TimeAnalysis';
import CategoryBreakdown from './aptitude/CategoryBreakdown';

interface OptimizedAptitudeTabProps {
  assessmentData: StrictAssessmentData;
  getAptitudeScorePercentage: (data: StrictAssessmentData) => number;
  generateAdvancedAnalysis?: (type: string) => void;
  generatingAnalysis?: Record<string, boolean>;
}

const OptimizedAptitudeTab: React.FC<OptimizedAptitudeTabProps> = memo(({
  assessmentData,
  getAptitudeScorePercentage,
  generateAdvancedAnalysis,
  generatingAnalysis = {}
}) => {
  // Extract aptitude results or initialize to empty arrays
  const aptitudeResults = assessmentData?.aptitudeResults || [];
  const categories = assessmentData?.aptitudeCategories || [];
  
  // Ensure aptitude score calculation uses correct values
  const totalQuestions = assessmentData.aptitudeTotal || 30;
  const correctAnswers = assessmentData.aptitudeScore || 0;
  
  // Calculate time metrics
  const timeSpentMs = assessmentData?.antiCheatingMetrics?.timeSpentMs || 
                      assessmentData?.antiCheatingMetrics?.totalTypingTime || 0;

  // Convert categories to expected format for CategoryBreakdown
  const categoryData = categories.map(cat => ({
    name: cat.name,
    correct: cat.score || 0,
    total: cat.total || 0,
    source: 'aptitude'
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <ScoreDisplay 
            correctAnswers={correctAnswers} 
            totalQuestions={totalQuestions} 
          />
          <TimeAnalysis 
            timeSpentMs={timeSpentMs}
            totalQuestions={totalQuestions}
          />
        </div>
        <CategoryBreakdown 
          categories={categoryData} 
          actualScore={correctAnswers} 
          totalQuestions={totalQuestions} 
        />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return shallowEqual(prevProps.assessmentData, nextProps.assessmentData) &&
         prevProps.getAptitudeScorePercentage === nextProps.getAptitudeScorePercentage &&
         shallowEqual(prevProps.generatingAnalysis, nextProps.generatingAnalysis);
});

OptimizedAptitudeTab.displayName = "OptimizedAptitudeTab";

export { OptimizedAptitudeTab as AptitudeTab };
export default OptimizedAptitudeTab;
