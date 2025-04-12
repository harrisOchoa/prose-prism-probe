
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";

interface AssessmentDetailsProps {
  assessment: any;
  onBack: () => void;
}

const AssessmentDetails: React.FC<AssessmentDetailsProps> = ({ assessment, onBack }) => {
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
          <CardTitle>Writing Prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {assessment.completedPrompts.map((prompt: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">{prompt.question}</h3>
              <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">
                {prompt.answer}
              </div>
              <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                <span>Word count: {prompt.wordCount}</span>
                <span>Time spent: {Math.round(prompt.timeSpent / 60)} minutes</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentDetails;
