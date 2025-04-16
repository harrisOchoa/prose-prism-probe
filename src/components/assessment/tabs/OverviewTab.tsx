
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sparkles, ThumbsUp, ThumbsDown, AlertCircle, FileCheck, Loader2, Shield } from "lucide-react";
import AntiCheatingMetrics from "../AntiCheatingMetrics";

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
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Anti-Cheating Metrics Card - Positioned at the top for visibility */}
      {assessmentData.antiCheatingMetrics ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Shield className="mr-2 h-5 w-5 text-purple-500" />
              Assessment Integrity Data
            </CardTitle>
            <CardDescription>
              Monitoring metrics collected during the assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AntiCheatingMetrics metrics={assessmentData.antiCheatingMetrics} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-200 shadow-sm bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Shield className="mr-2 h-5 w-5 text-amber-500" />
              Assessment Integrity Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              <p className="text-amber-700">No integrity monitoring data available for this assessment.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-indigo-500" />
            <span className="pdf-hide">Assessment Summary</span>
            <span className="hidden pdf-show">Assessment Summary</span>
          </CardTitle>
          <CardDescription>
            Based on aptitude test performance and writing assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatingSummary ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
              <p className="text-sm text-gray-500">Generating insights...</p>
            </div>
          ) : assessmentData.aiSummary ? (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-md p-4 relative">
                <Sparkles className="absolute top-4 right-4 h-4 w-4 text-indigo-500 opacity-40" />
                <p className="text-indigo-900 italic">"{assessmentData.aiSummary}"</p>
              </div>
              
              {assessmentData.strengths && assessmentData.weaknesses && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium flex items-center text-green-700 mb-2">
                      <ThumbsUp className="h-4 w-4 mr-2" /> Key Strengths
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {assessmentData.strengths.map((strength: string, index: number) => (
                        <li key={`strength-${index}`} className="flex items-start">
                          <ThumbsUp className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium flex items-center text-amber-700 mb-2">
                      <ThumbsDown className="h-4 w-4 mr-2" /> Areas for Improvement
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {assessmentData.weaknesses.map((weakness: string, index: number) => (
                        <li key={`weakness-${index}`} className="flex items-start">
                          <AlertCircle className="h-4 w-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : assessmentData.writingScores && assessmentData.writingScores.length > 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">
                Summary not generated yet. Click the "Regenerate Insights" button above to create an assessment summary.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-md p-4 text-center">
              <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
              <p className="text-amber-800 font-medium">Writing needs to be evaluated first</p>
              <p className="text-amber-700 text-sm mt-1">
                Use the "Evaluate Writing" button to assess the candidate's writing and generate insights.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-green-500" />
              Assessment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Aptitude Score</TableCell>
                  <TableCell className="text-right">
                    <span className={`px-2 py-1 rounded ${getAptitudeScorePercentage() >= 70 ? 'bg-green-100 text-green-700' : getAptitudeScorePercentage() >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {assessmentData.aptitudeScore}/{assessmentData.aptitudeTotal} ({getAptitudeScorePercentage()}%)
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Writing Score</TableCell>
                  <TableCell className="text-right">
                    {assessmentData.overallWritingScore ? (
                      <span className={`px-2 py-1 rounded ${getWritingScorePercentage() >= 70 ? 'bg-green-100 text-green-700' : getWritingScorePercentage() >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {assessmentData.overallWritingScore}/5 ({getWritingScorePercentage()}%)
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">Not Evaluated</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Overall Rating</TableCell>
                  <TableCell className="text-right">
                    <span className={`px-2 py-1 rounded ${getOverallScore() >= 70 ? 'bg-green-100 text-green-700' : getOverallScore() >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {getOverallScore()}%
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
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
      </div>
    </div>
  );
};

export default OverviewTab;
