
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { BrainCircuit } from "lucide-react";

interface CategoryBreakdownProps {
  categories?: Array<{
    name: string;
    correct: number;
    total: number;
    source?: string;
  }>;
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ categories = [] }) => {
  // Log received categories
  console.log('Received Categories:', categories);

  // If no categories data, generate sample data with clear attribution
  const displayCategories = categories.length > 0 
    ? categories 
    : [
        { name: "Logical Reasoning", correct: 7, total: 10, source: "Sample Data" },
        { name: "Numerical Analysis", correct: 5, total: 8, source: "Sample Data" },
        { name: "Verbal Comprehension", correct: 4, total: 7, source: "Sample Data" },
        { name: "Problem Solving", correct: 4, total: 5, source: "Sample Data" }
      ];
  
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-center mb-3">
        <BrainCircuit className="h-5 w-5 mr-2 text-purple-500" />
        <h4 className="font-medium">Category Performance</h4>
      </div>
      <div className="space-y-3">
        {displayCategories.map((category, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm">
                {category.name} 
                {category.source && <span className="text-xs text-gray-500 ml-2">(Sample Data)</span>}
              </span>
              <span className="text-sm font-medium">
                {category.correct}/{category.total} 
                <span className="text-gray-500 ml-1">
                  ({Math.round((category.correct / category.total) * 100)}%)
                </span>
              </span>
            </div>
            <Progress 
              value={(category.correct / category.total) * 100} 
              className="h-2.5 bg-gray-100" 
              color={
                (category.correct / category.total) >= 0.8 ? "#22c55e" : 
                (category.correct / category.total) >= 0.6 ? "#eab308" : 
                "#ef4444"
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

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
  
  // Extract aptitude results or initialize to empty arrays
  const aptitudeResults = assessmentData?.aptitudeResults || [];
  const categories = assessmentData?.aptitudeCategories || [];
  
  // Ensure aptitude score calculation uses correct values
  const totalQuestions = assessmentData.aptitudeTotal || 30;
  const correctAnswers = assessmentData.aptitudeScore || 0;
  const scoreFraction = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  const scorePercentage = Math.round(scoreFraction * 100);
  
  console.log('Calculated Metrics:', {
    totalQuestions,
    correctAnswers,
    scoreFraction,
    scorePercentage
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
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
          
          {/* Time Analysis Card */}
          <div className="rounded-lg border p-4 shadow-sm">
            <h4 className="font-medium mb-3">Time Analysis</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Average time per question</span>
                <span className="text-sm font-medium">
                  {assessmentData?.aptitudeTimeSpent && totalQuestions > 0 
                    ? Math.round((assessmentData.aptitudeTimeSpent / 1000) / totalQuestions) 
                    : 'N/A'} seconds
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total time spent</span>
                <span className="text-sm font-medium">
                  {assessmentData?.aptitudeTimeSpent 
                    ? `${Math.floor((assessmentData.aptitudeTimeSpent / 1000) / 60)}m ${Math.round((assessmentData.aptitudeTimeSpent / 1000) % 60)}s` 
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AptitudeTab };
