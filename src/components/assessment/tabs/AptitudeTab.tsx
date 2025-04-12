
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PerformanceRatingProps {
  percentage: number;
}

const PerformanceRating: React.FC<PerformanceRatingProps> = ({ percentage }) => {
  const getRatingLabel = (percent: number) => {
    if (percent >= 80) return 'Excellent';
    if (percent >= 70) return 'Good';
    if (percent >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };
  
  const getRatingClass = (percent: number) => {
    if (percent >= 80) return 'bg-green-50 text-green-700';
    if (percent >= 70) return 'bg-blue-50 text-blue-700';
    if (percent >= 60) return 'bg-yellow-50 text-yellow-700';
    return 'bg-red-50 text-red-700';
  };
  
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium mb-2">Performance Rating</h4>
      <div className={`py-2 px-3 rounded ${getRatingClass(percentage)}`}>
        {getRatingLabel(percentage)}
      </div>
    </div>
  );
};

interface ScoreBreakdownProps {
  correct: number;
  total: number;
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ correct, total }) => {
  const incorrect = total - correct;
  
  return (
    <div className="rounded-lg border p-4">
      <h4 className="font-medium mb-3">Score Breakdown</h4>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Correct Answers</span>
            <span className="text-sm font-medium text-green-600">{correct}</span>
          </div>
          <Progress value={(correct / total) * 100} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Incorrect Answers</span>
            <span className="text-sm font-medium text-red-600">{incorrect}</span>
          </div>
          <Progress 
            value={(incorrect / total) * 100} 
            className="h-2"
            style={{'--progress-background': '#ef4444'} as React.CSSProperties} 
          />
        </div>
      </div>
    </div>
  );
};

interface AptitudeTabProps {
  assessmentData: any;
  getAptitudeScorePercentage: () => number;
}

const AptitudeTab: React.FC<AptitudeTabProps> = ({
  assessmentData,
  getAptitudeScorePercentage
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aptitude Test Results</CardTitle>
        <CardDescription>
          Performance on multiple-choice questions assessing cognitive abilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">Score</h3>
                <p className="text-3xl font-bold">{assessmentData.aptitudeScore}/{assessmentData.aptitudeTotal}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Percentage</h3>
                <p className="text-3xl font-bold">
                  {getAptitudeScorePercentage()}%
                </p>
              </div>
            </div>
            
            <PerformanceRating percentage={getAptitudeScorePercentage()} />
          </div>
          
          <ScoreBreakdown 
            correct={assessmentData.aptitudeScore} 
            total={assessmentData.aptitudeTotal} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AptitudeTab;
