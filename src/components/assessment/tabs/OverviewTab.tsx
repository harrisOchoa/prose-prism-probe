
import React from "react";
import { AntiCheatingCard, SummaryCard, ScoreSummaryCard, PerformanceComparisonCard } from "./overview";

interface OverviewTabProps {
  assessmentData: any;
  generatingSummary: boolean;
  getAptitudeScorePercentage: () => number;
  getWritingScorePercentage: () => number;
  getOverallScore: () => number;
  getProgressColor: (value: number) => string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  assessmentData,
  generatingSummary,
  getAptitudeScorePercentage,
  getWritingScorePercentage,
  getOverallScore,
  getProgressColor
}) => {
  // Debug log to see what metrics are present
  console.log("Overview Tab - Assessment Data:", assessmentData);
  console.log("Overview Tab - Anti-Cheating Metrics:", assessmentData.antiCheatingMetrics);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Anti-Cheating Metrics Card - Positioned at the top for visibility */}
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
};

export default OverviewTab;
