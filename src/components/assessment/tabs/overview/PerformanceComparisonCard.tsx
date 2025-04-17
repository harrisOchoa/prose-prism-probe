
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PerformanceComparisonCardProps {
  getAptitudeScorePercentage: () => number;
  getWritingScorePercentage: () => number;
  getOverallScore: () => number;
  getProgressColor: (value: number) => string;
}

const PerformanceComparisonCard: React.FC<PerformanceComparisonCardProps> = ({
  getAptitudeScorePercentage,
  getWritingScorePercentage,
  getOverallScore,
  getProgressColor
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Aptitude ({getAptitudeScorePercentage()}%)</span>
          </div>
          <Progress value={getAptitudeScorePercentage()} className="h-2 bg-gray-200" 
            color={getProgressColor(getAptitudeScorePercentage())}
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Writing ({getWritingScorePercentage()}%)</span>
          </div>
          <Progress value={getWritingScorePercentage()} className="h-2 bg-gray-200"
            color={getProgressColor(getWritingScorePercentage())}
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Overall ({getOverallScore()}%)</span>
          </div>
          <Progress value={getOverallScore()} className="h-2 bg-gray-200"
            color={getProgressColor(getOverallScore())}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceComparisonCard;
