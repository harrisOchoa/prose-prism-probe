
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { saveAssessmentResult } from "@/firebase/assessmentService";
import { toast } from "@/components/ui/use-toast";
import { WritingPromptItem } from "./AssessmentManager";
import { evaluateAllWritingPrompts, WritingScore } from "@/services/geminiService";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

interface AssessmentCompleteProps {
  candidateName: string;
  candidatePosition: string;
  wordCount: number;
  completedPrompts: WritingPromptItem[];
  aptitudeScore: number;
  aptitudeTotal: number;
  restartAssessment: () => void;
  antiCheatingMetrics?: AntiCheatingMetrics;
}

const AssessmentComplete = ({
  candidateName,
  candidatePosition,
  wordCount,
  completedPrompts,
  aptitudeScore,
  aptitudeTotal,
  restartAssessment,
  antiCheatingMetrics
}: AssessmentCompleteProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [writingScores, setWritingScores] = useState<WritingScore[]>([]);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  // Auto-submit the assessment when component mounts
  useEffect(() => {
    handleSubmit();
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) return;
    
    setIsSubmitting(true);
    
    try {
      // Log the aptitude score being submitted
      console.log("Submitting assessment with aptitude score:", aptitudeScore, "out of", aptitudeTotal);
      
      // Save the assessment result to the database
      const id = await saveAssessmentResult(
        candidateName,
        candidatePosition,
        completedPrompts,
        aptitudeScore,
        aptitudeTotal,
        writingScores.length > 0 ? writingScores : undefined,
        antiCheatingMetrics
      );
      
      setAssessmentId(id);
      setIsSubmitted(true);
      
      toast({
        title: "Assessment Submitted",
        description: "Your assessment has been successfully submitted.",
      });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const evaluateResponses = async () => {
    if (isEvaluating || completedPrompts.length === 0) return;
    
    setIsEvaluating(true);
    setEvaluationProgress(0);
    
    const scores: WritingScore[] = [];
    
    try {
      for (let i = 0; i < completedPrompts.length; i++) {
        const prompt = completedPrompts[i];
        
        // Skip empty responses
        if (!prompt.response.trim()) {
          scores.push({
            promptId: prompt.id,
            score: 0,
            feedback: "No response provided",
            aiDetection: {
              probability: 0,
              notes: "No content to analyze"
            }
          });
          setEvaluationProgress(((i + 1) / completedPrompts.length) * 100);
          continue;
        }
        
        try {
          const evaluation = await evaluateAllWritingPrompts([prompt]);
          if (evaluation && evaluation.length > 0) {
            scores.push(evaluation[0]);
          } else {
            scores.push({
              promptId: prompt.id,
              score: 0,
              feedback: "Error during evaluation",
              aiDetection: {
                probability: 0,
                notes: "Evaluation failed"
              }
            });
          }
        } catch (evalError) {
          console.error(`Error evaluating prompt ${prompt.id}:`, evalError);
          scores.push({
            promptId: prompt.id,
            score: 0,
            feedback: "Error evaluating response",
            aiDetection: {
              probability: 0,
              notes: "Evaluation error"
            }
          });
        }
        
        // Update progress
        setEvaluationProgress(((i + 1) / completedPrompts.length) * 100);
      }
      
      setWritingScores(scores);
      
      // If already submitted, update the assessment with scores
      if (isSubmitted && assessmentId) {
        await saveAssessmentResult(
          candidateName,
          candidatePosition,
          completedPrompts,
          aptitudeScore,
          aptitudeTotal,
          scores,
          antiCheatingMetrics
        );
        
        toast({
          title: "Evaluation Complete",
          description: "Your writing has been evaluated and results updated.",
        });
      }
    } catch (error) {
      console.error("Error during evaluation:", error);
      toast({
        title: "Evaluation Error",
        description: "There was an error evaluating your responses.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="assessment-card max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="assessment-title">Assessment Complete</h1>
        <p className="text-lg text-gray-600 mt-2">
          Thank you for completing the assessment, {candidateName}!
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assessment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Candidate Name</p>
              <p className="font-medium">{candidateName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Position</p>
              <p className="font-medium">{candidatePosition}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Aptitude Score</p>
              <p className="font-medium">{aptitudeScore} out of {aptitudeTotal}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Writing Assessment</p>
              <p className="font-medium">{completedPrompts.length} prompts completed</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Total Word Count</p>
              <p className="font-medium">{wordCount} words</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Submission Status</p>
              <div className="flex items-center">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Submitting...</span>
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-green-600 font-medium">Submitted Successfully</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                    <span className="text-amber-600">Not Submitted</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {isEvaluating && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span>Evaluating writing...</span>
                <span>{Math.round(evaluationProgress)}%</span>
              </div>
              <Progress value={evaluationProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={evaluateResponses} 
          disabled={isEvaluating || completedPrompts.length === 0}
          className="min-w-[200px]"
        >
          {isEvaluating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Evaluating...
            </>
          ) : writingScores.length > 0 ? (
            "Re-evaluate Writing"
          ) : (
            "Evaluate Writing"
          )}
        </Button>
        
        <Button 
          onClick={restartAssessment} 
          variant="outline"
          className="min-w-[200px]"
        >
          Start New Assessment
        </Button>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Your assessment has been recorded. Thank you for your participation!</p>
        {assessmentId && (
          <p className="mt-2 text-xs">Assessment ID: {assessmentId}</p>
        )}
      </div>
    </div>
  );
};

export default AssessmentComplete;
