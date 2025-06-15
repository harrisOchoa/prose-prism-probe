
import React, { memo } from "react";
import { StrictAssessmentData } from "@/types/optimized";
import { shallowEqual } from "@/utils/shallowCompare";
import { AntiCheatingCard, SummaryCard, ScoreSummaryCard, PerformanceComparisonCard } from "./overview";

interface OptimizedOverviewTabProps {
  assessmentData: StrictAssessmentData;
  generatingSummary: boolean;
  getAptitudeScorePercentage: () => number;
  getWritingScorePercentage: () => number;
  getOverallScore: () => number;
  getProgressColor: (value: number) => string;
}

const OptimizedOverviewTab: React.FC<OptimizedOverviewTabProps> = memo(({
  assessmentData,
  generatingSummary,
  getAptitudeScorePercentage,
  getWritingScorePercentage,
  getOverallScore,
  getProgressColor
}) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Anti-Cheating Metrics Card - Will be hidden in PDF exports */}
      <AntiCheatingCard metrics={assessmentData.antiCheatingMetrics} />
      
      {/* Summary Card with AI insights */}
      <SummaryCard 
        assessmentData={assessmentData} 
        generatingSummary={generatingSummary} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assessment Summary Card */}
        <ScoreSummaryCard 
          assessmentData={assessmentData}
          getAptitudeScorePercentage={getAptitudeScorePercentage}
          getWritingScorePercentage={getWritingScorePercentage}
          getOverallScore={getOverallScore}
        />
        
        {/* Performance Comparison Card */}
        <PerformanceComparisonCard 
          getAptitudeScorePercentage={getAptitudeScorePercentage}
          getWritingScorePercentage={getWritingScorePercentage}
          getOverallScore={getOverallScore}
          getProgressColor={getProgressColor}
        />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function using shallow equality
  return shallowEqual(prevProps.assessmentData, nextProps.assessmentData) &&
         prevProps.generatingSummary === nextProps.generatingSummary &&
         prevProps.getAptitudeScorePercentage === nextProps.getAptitudeScorePercentage &&
         prevProps.getWritingScorePercentage === nextProps.getWritingScorePercentage &&
         prevProps.getOverallScore === nextProps.getOverallScore &&
         prevProps.getProgressColor === nextProps.getProgressColor;
});

OptimizedOverviewTab.displayName = "OptimizedOverviewTab";

export default OptimizedOverviewTab;
