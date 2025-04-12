
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, X, AlertCircle, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { scoringCriteria } from "@/services/geminiService";
import { toast } from "@/hooks/use-toast";
import { evaluateAllWritingPrompts } from "@/services/geminiService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useState } from "react";

interface AssessmentDetailsProps {
  assessment: any;
  onBack: () => void;
}

const AssessmentDetails: React.FC<AssessmentDetailsProps> = ({ assessment, onBack }) => {
  const [evaluating, setEvaluating] = useState(false);
  
  const getScoreColor = (score: number) => {
    if (score === 0) return "text-gray-600";
    if (score >= 4.5) return "text-green-600";
    if (score >= 3.5) return "text-blue-600";
    if (score >= 2.5) return "text-yellow-600";
    if (score >= 1.5) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score === 0) return "Not Evaluated";
    if (score >= 4.5) return "Exceptional";
    if (score >= 3.5) return "Proficient";
    if (score >= 2.5) return "Satisfactory";
    if (score >= 1.5) return "Basic";
    return "Needs Improvement";
  };

  const handleManualEvaluation = async () => {
    if (!assessment.completedPrompts || assessment.completedPrompts.length === 0) {
      toast({
        title: "No Writing Prompts",
        description: "This assessment does not have any completed writing prompts to evaluate.",
        variant: "destructive",
      });
      return;
    }

    try {
      setEvaluating(true);
      toast({
        title: "AI Evaluation Started",
        description: "The AI is now evaluating the writing responses. This may take a moment.",
      });

      // Call the API to evaluate all writing prompts
      const scores = await evaluateAllWritingPrompts(assessment.completedPrompts);
      
      if (scores.length === 0) {
        throw new Error("No scores were returned from evaluation");
      }

      // Calculate overall writing score (average of all prompt scores)
      const validScores = scores.filter(score => score.score > 0);
      const overallScore = validScores.length > 0
        ? Number((validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length).toFixed(1))
        : 0;

      // Update the assessment in Firestore
      const assessmentRef = doc(db, "assessments", assessment.id);
      await updateDoc(assessmentRef, {
        writingScores: scores,
        overallWritingScore: overallScore
      });

      // Success message
      toast({
        title: "Evaluation Complete",
        description: `Successfully evaluated ${validScores.length} of ${scores.length} writing prompts.`,
        variant: "default",
      });

      // Refresh the page to show updated scores
      window.location.reload();
    } catch (error) {
      console.error("Error during manual evaluation:", error);
      toast({
        title: "Evaluation Failed",
        description: `There was an error evaluating the writing: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setEvaluating(false);
    }
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
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Writing Assessment Score</CardTitle>
            <Button 
              onClick={handleManualEvaluation} 
              disabled={evaluating} 
              variant="outline"
              className="px-3"
            >
              <Zap className="mr-2 h-4 w-4 text-yellow-500" />
              {evaluating ? "Evaluating..." : "Evaluate Writing"}
            </Button>
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
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                <p>No AI evaluation available for this assessment.</p>
              </div>
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
                  
                  {promptScore ? (
                    <div className={`rounded-full px-3 py-1 text-white font-medium ${
                      promptScore.score === 0 
                        ? "bg-gray-400" 
                        : getScoreColor(promptScore.score).replace("text-", "bg-")
                    } bg-opacity-90`}>
                      {promptScore.score === 0 ? "Not Evaluated" : `Score: ${promptScore.score}/5`}
                    </div>
                  ) : (
                    <div className="rounded-full px-3 py-1 text-white font-medium bg-gray-400 bg-opacity-90">
                      Not Evaluated
                    </div>
                  )}
                </div>
                
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm mt-2">
                  {prompt.response}
                </div>
                
                {promptScore && (
                  <div className={`mt-4 p-3 rounded border ${
                    promptScore.score === 0 
                      ? "bg-gray-50 border-gray-200" 
                      : "bg-blue-50 border-blue-100"
                  }`}>
                    <p className={`text-sm font-medium ${
                      promptScore.score === 0 ? "text-gray-700" : "text-blue-700"
                    }`}>
                      AI Feedback:
                    </p>
                    <p className={`text-sm ${
                      promptScore.score === 0 ? "text-gray-600" : "text-blue-600"
                    }`}>
                      {promptScore.feedback}
                    </p>
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
