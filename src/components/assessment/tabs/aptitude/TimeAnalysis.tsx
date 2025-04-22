
import React from 'react';

interface TimeAnalysisProps {
  timeSpentMs: number;
  totalQuestions: number;
}

const TimeAnalysis: React.FC<TimeAnalysisProps> = ({ timeSpentMs, totalQuestions }) => {
  // Format time for display
  const formatTime = (ms: number) => {
    if (!ms) return 'N/A';
    const seconds = Math.round(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Calculate average time per question
  const avgTimePerQuestion = timeSpentMs && totalQuestions > 0 
    ? Math.round((timeSpentMs / 1000) / totalQuestions) 
    : null;

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h4 className="font-medium mb-3">Time Analysis</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Average time per question</span>
          <span className="text-sm font-medium">
            {avgTimePerQuestion ? `${avgTimePerQuestion} seconds` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Total time spent</span>
          <span className="text-sm font-medium">
            {formatTime(timeSpentMs)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimeAnalysis;
