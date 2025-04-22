
import React from 'react';
import ScoreDisplay from './aptitude/ScoreDisplay';
import TimeAnalysis from './aptitude/TimeAnalysis';
import CategoryBreakdown from './aptitude/CategoryBreakdown';

interface AptitudeTabProps {
  assessmentData: any;
  getAptitudeScorePercentage: (data: any) => number;
  generateAdvancedAnalysis?: (type: string) => void;
  generatingAnalysis?: Record<string, boolean>;
}

const AptitudeTab: React.FC<AptitudeTabProps> = ({
  assessmentData,
  getAptitudeScorePercentage,
  generateAdvancedAnalysis,
  generatingAnalysis = {}
}) => {
  // Enhanced logging
  console.log('AptitudeTab - Full Assessment Data:', JSON.stringify(assessmentData, null, 2));
  console.log('AptitudeTab - Aptitude Score:', assessmentData.aptitudeScore);
  console.log('AptitudeTab - Aptitude Total:', assessmentData.aptitudeTotal);
  console.log('AptitudeTab - Time Data:', {
    aptitudeTimeSpent: assessmentData.aptitudeTimeSpent,
    antiCheatingMetrics: assessmentData.antiCheatingMetrics
  });
  
  // Extract aptitude results or initialize to empty arrays
  const aptitudeResults = assessmentData?.aptitudeResults || [];
  const categories = assessmentData?.aptitudeCategories || [];
  
  // Ensure aptitude score calculation uses correct values
  const totalQuestions = assessmentData.aptitudeTotal || 30;
  const correctAnswers = assessmentData.aptitudeScore || 0;
  
  // Calculate time metrics
  // First try to get time from antiCheatingMetrics, then fall back to aptitudeTimeSpent
  const timeSpentMs = assessmentData?.antiCheatingMetrics?.timeSpentMs || 
                      assessmentData?.antiCheatingMetrics?.totalTypingTime || 
                      assessmentData?.aptitudeTimeSpent || 0;

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
          categories={categories} 
          actualScore={correctAnswers} 
          totalQuestions={totalQuestions} 
        />
      </div>
    </div>
  );
};

export { AptitudeTab };
