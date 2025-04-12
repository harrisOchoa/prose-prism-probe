
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { scoringCriteria } from "@/services/geminiService";

interface AssessmentDetailsProps {
  assessment: any;
  onBack: () => void;
}

const AssessmentDetails: React.FC<AssessmentDetailsProps> = ({ assessment, onBack }) => {
  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-600";
    if (score >= 3.5) return "text-blue-600";
    if (score >= 2.5) return "text-yellow-600";
    if (score >= 1.5) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return "Exceptional";
    if (score >= 3.5) return "Proficient";
    if (score >= 2.5) return "Satisfactory";
    if (score >= 1.5) return "Basic";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Assessment Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidate Information</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Name</h3>
            <p className="text-lg">{assessment.candidateName}</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Position</h3>
            <p className="text-lg">{assessment.candidatePosition}</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Submission Date</h3>
            <p className="text-lg">
              {assessment.submittedAt && assessment.submittedAt.toDate
                ? new Date(assessment.submittedAt.toDate()).toLocaleString()
                : "N/A"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Total Word Count</h3>
            <p className="text-lg">{assessment.wordCount} words</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aptitude Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">Score</h3>
                <p className="text-3xl font-bold">{assessment.aptitudeScore}/{assessment.aptitudeTotal}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Percentage</h3>
                <p className="text-3xl font-bold">
                  {Math.round((assessment.aptitudeScore / assessment.aptitudeTotal) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Writing Assessment Score</CardTitle>
          </CardHeader>
          <CardContent>
            {assessment.overallWritingScore ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Overall Score</h3>
                    <p className={`text-3xl font-bold ${getScoreColor(assessment.overallWritingScore)}`}>
                      {assessment.overallWritingScore}/5
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Rating</h3>
                    <p className={`text-xl font-bold ${getScoreColor(assessment.overallWritingScore)}`}>
                      {getScoreLabel(assessment.overallWritingScore)}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Score Legend:</p>
                  <ul className="space-y-1 mt-1">
                    {Object.entries(scoringCriteria).map(([score, description]) => (
                      <li key={score} className="text-xs">
                        <span className="font-medium">{score}:</span> {description.split(':')[1].trim().substring(0, 50)}...
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No AI evaluation available for this assessment.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Writing Prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {assessment.completedPrompts.map((prompt: any, index: number) => {
            // Find matching writing score if available
            const promptScore = assessment.writingScores?.find(
              (score: any) => score.promptId === prompt.id
            );
            
            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium mb-2">{prompt.prompt}</h3>
                  
                  {promptScore && (
                    <div className={`rounded-full px-3 py-1 text-white font-medium ${getScoreColor(promptScore.score)} bg-opacity-90`}>
                      Score: {promptScore.score}/5
                    </div>
                  )}
                </div>
                
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">
                  {prompt.response}
                </div>
                
                {promptScore && (
                  <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-100">
                    <p className="text-sm font-medium text-blue-700">AI Feedback:</p>
                    <p className="text-sm text-blue-600">{promptScore.feedback}</p>
                  </div>
                )}
                
                <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                  <span>Word count: {prompt.wordCount}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentDetails;
