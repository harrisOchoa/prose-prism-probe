
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface ScoreDisplayProps {
  correctAnswers: number;
  totalQuestions: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  correctAnswers, 
  totalQuestions 
}) => {
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-medium mb-4">Aptitude Test Results</h3>
      
      <div className="flex justify-between mb-2">
        <span>Score</span>
        <span className="font-medium">{correctAnswers}/{totalQuestions} ({scorePercentage}%)</span>
      </div>
      
      <Progress 
        value={scorePercentage} 
        className="h-3 mb-4" 
        color={
          scorePercentage >= 80 ? "#22c55e" : 
          scorePercentage >= 60 ? "#eab308" : 
          "#ef4444"
        }
      />
      
      {totalQuestions > 0 ? (
        <div className="space-y-2 mt-4">
          <p className="text-sm text-gray-500">
            The candidate answered {correctAnswers} out of {totalQuestions} 
            questions correctly ({scorePercentage}%).
          </p>
          
          {scorePercentage >= 80 ? (
            <p className="text-sm text-green-600">
              This is an excellent performance, indicating strong aptitude abilities.
            </p>
          ) : scorePercentage >= 60 ? (
            <p className="text-sm text-yellow-600">
              This is a good performance, with room for improvement in some areas.
            </p>
          ) : (
            <p className="text-sm text-red-600">
              This performance suggests challenges with aptitude questions that may need attention.
            </p>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-500 my-4">No aptitude test results available.</div>
      )}
    </div>
  );
};

export default ScoreDisplay;
