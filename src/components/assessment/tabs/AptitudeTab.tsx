
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Performance Rating</h4>
              <div className={`py-2 px-3 rounded ${
                getAptitudeScorePercentage() >= 80 ? 'bg-green-50 text-green-700' :
                getAptitudeScorePercentage() >= 70 ? 'bg-blue-50 text-blue-700' :
                getAptitudeScorePercentage() >= 60 ? 'bg-yellow-50 text-yellow-700' :
                'bg-red-50 text-red-700'
              }`}>
                {
                  getAptitudeScorePercentage() >= 80 ? 'Excellent' :
                  getAptitudeScorePercentage() >= 70 ? 'Good' :
                  getAptitudeScorePercentage() >= 60 ? 'Satisfactory' :
                  'Needs Improvement'
                }
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-3">Score Breakdown</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Correct Answers</span>
                  <span className="text-sm font-medium text-green-600">{assessmentData.aptitudeScore}</span>
                </div>
                <Progress value={(assessmentData.aptitudeScore / assessmentData.aptitudeTotal) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Incorrect Answers</span>
                  <span className="text-sm font-medium text-red-600">
                    {assessmentData.aptitudeTotal - assessmentData.aptitudeScore}
                  </span>
                </div>
                <Progress 
                  value={((assessmentData.aptitudeTotal - assessmentData.aptitudeScore) / assessmentData.aptitudeTotal) * 100} 
                  className="h-2"
                  style={{'--progress-background': '#ef4444'} as React.CSSProperties} 
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AptitudeTab;
