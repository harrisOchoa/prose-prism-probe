
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { saveAssessmentResult } from "@/firebase/assessmentService";
import { toast } from "@/components/ui/use-toast";
import { WritingPromptItem } from "./AssessmentManager";
import { CheckCircle } from "lucide-react";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

interface AssessmentCompleteProps {
  candidateName: string;
  candidatePosition: string;
  completedPrompts: WritingPromptItem[];
  aptitudeScore: number;
  aptitudeTotal: number;
  restartAssessment: () => void;
  antiCheatingMetrics?: AntiCheatingMetrics;
  wordCount: number; // Added wordCount prop
}

const AssessmentComplete = ({
  candidateName,
  candidatePosition,
  completedPrompts,
  aptitudeScore,
  aptitudeTotal,
  restartAssessment,
  antiCheatingMetrics,
  wordCount // Added to destructuring
}: AssessmentCompleteProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  // Auto-submit the assessment when component mounts
  useEffect(() => {
    handleSubmit();
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting assessment with aptitude score:", aptitudeScore, "out of", aptitudeTotal);
      
      const id = await saveAssessmentResult(
        candidateName,
        candidatePosition,
        completedPrompts,
        aptitudeScore,
        aptitudeTotal,
        undefined, // No writing scores at this stage
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

  return (
    <div className="assessment-card max-w-4xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Assessment Complete</h1>
        <p className="text-lg text-gray-600">
          Thank you for completing the assessment, {candidateName}!
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            Your assessment has been successfully recorded. We appreciate your participation!
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          onClick={restartAssessment}
          variant="outline"
          className="min-w-[200px]"
        >
          Start New Assessment
        </Button>
      </div>

      {assessmentId && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">Assessment ID: {assessmentId}</p>
        </div>
      )}
    </div>
  );
};

export default AssessmentComplete;
