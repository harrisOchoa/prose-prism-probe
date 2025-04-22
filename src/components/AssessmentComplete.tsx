
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { saveAssessmentResult, AntiCheatingMetrics } from "@/firebase/assessmentService";
import { toast } from "@/hooks/use-toast";
import { evaluateAllWritingPrompts, WritingScore } from "@/services/geminiService";
import SuccessHeader from "./assessment/SuccessHeader";
import SubmissionDetails from "./assessment/SubmissionDetails";
import CandidateInformation from "./assessment/CandidateInformation";

// Define the type for a writing prompt
interface WritingPromptItem {
  id: number;
  prompt: string;
  response: string;
  wordCount: number;
}

interface AssessmentCompleteProps {
  wordCount: number;
  candidateName: string;
  candidatePosition: string;
  restartAssessment: () => void;
  completedPrompts: WritingPromptItem[];
  aptitudeScore?: number;
  aptitudeTotal?: number;
  antiCheatingMetrics?: AntiCheatingMetrics;
}

const AssessmentComplete = ({ 
  wordCount, 
  candidateName, 
  candidatePosition, 
  restartAssessment, 
  completedPrompts,
  aptitudeScore = 0,
  aptitudeTotal = 0,
  antiCheatingMetrics
}: AssessmentCompleteProps) => {
  const [isSaving, setIsSaving] = useState(true);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [writingScores, setWritingScores] = useState<WritingScore[]>([]);
  const [evaluationStatus, setEvaluationStatus] = useState<"loading" | "complete" | "error">("loading");
  const [savingStep, setSavingStep] = useState<"evaluating" | "saving" | "complete">("evaluating");

  useEffect(() => {
    const evaluateAndSave = async () => {
      try {
        setSavingStep("evaluating");
        setEvaluationStatus("loading");
        const scores = await evaluateAllWritingPrompts(completedPrompts);
        setWritingScores(scores);
        
        let avgScore = 0;
        if (scores.length > 0) {
          const totalScore = scores.reduce((sum, evaluation) => sum + evaluation.score, 0);
          avgScore = Number((totalScore / scores.length).toFixed(1));
        }
        
        setEvaluationStatus("complete");
        setSavingStep("saving");
        
        console.log("Saving assessment with anti-cheating metrics:", antiCheatingMetrics);
        
        const id = await saveAssessmentResult(
          candidateName,
          candidatePosition,
          completedPrompts,
          aptitudeScore,
          aptitudeTotal,
          scores,
          antiCheatingMetrics
        );
        
        setSubmissionId(id);
        setIsSaving(false);
        setSavingStep("complete");
        
        toast({
          title: "Assessment Saved",
          description: "Your assessment has been successfully saved. Thank you for your participation.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error saving assessment:", error);
        setIsSaving(false);
        setEvaluationStatus("error");
        setSavingStep("complete");
        
        toast({
          title: "Error Saving Assessment",
          description: "There was a problem saving your assessment. Please contact support.",
          variant: "destructive",
        });
      }
    };

    evaluateAndSave();
  }, [candidateName, candidatePosition, completedPrompts, aptitudeScore, aptitudeTotal, antiCheatingMetrics]);

  const getSavingMessage = () => {
    switch (savingStep) {
      case "evaluating":
        return "Evaluating your responses...";
      case "saving":
        return "Saving your assessment...";
      case "complete":
        return "Assessment complete!";
      default:
        return "Processing...";
    }
  };
  
  return (
    <div className="assessment-card max-w-4xl mx-auto text-center px-2 sm:px-4 py-6 animate-fade-in">
      <SuccessHeader candidateName={candidateName} />
      
      <SubmissionDetails 
        isSaving={isSaving} 
        submissionId={submissionId} 
        evaluationStatus={evaluationStatus}
        savingMessage={getSavingMessage()}
      />
      
      <CandidateInformation 
        candidateName={candidateName} 
        candidatePosition={candidatePosition} 
      />
      
      <div className="flex flex-col items-center justify-center mt-4">
        <Button 
          className="hirescribe-button w-full max-w-xs sm:w-auto"
          onClick={restartAssessment}
          disabled={isSaving}
        >
          Start New Assessment
        </Button>
      </div>
    </div>
  );
};

export default AssessmentComplete;
