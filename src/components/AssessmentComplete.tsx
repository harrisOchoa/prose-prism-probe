
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { saveAssessmentResult } from "@/firebase/assessmentService";
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
}

const AssessmentComplete = ({ 
  wordCount, 
  candidateName, 
  candidatePosition, 
  restartAssessment, 
  completedPrompts,
  aptitudeScore = 0,
  aptitudeTotal = 0
}: AssessmentCompleteProps) => {
  const [isSaving, setIsSaving] = useState(true);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [writingScores, setWritingScores] = useState<WritingScore[]>([]);
  const [evaluationStatus, setEvaluationStatus] = useState<"loading" | "complete" | "error">("loading");

  useEffect(() => {
    const evaluateAndSave = async () => {
      try {
        // First evaluate the writing responses (still do this in the background)
        setEvaluationStatus("loading");
        const scores = await evaluateAllWritingPrompts(completedPrompts);
        setWritingScores(scores);
        
        // Calculate overall score (for internal storage only)
        let avgScore = 0;
        if (scores.length > 0) {
          const totalScore = scores.reduce((sum, evaluation) => sum + evaluation.score, 0);
          avgScore = Number((totalScore / scores.length).toFixed(1));
        }
        
        setEvaluationStatus("complete");
        
        // Then save everything to Firebase
        const id = await saveAssessmentResult(
          candidateName,
          candidatePosition,
          completedPrompts,
          aptitudeScore,
          aptitudeTotal,
          scores
        );
        
        setSubmissionId(id);
        setIsSaving(false);
        
        toast({
          title: "Assessment Saved",
          description: "Your assessment has been successfully saved. Thank you for your participation.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error saving assessment:", error);
        setIsSaving(false);
        setEvaluationStatus("error");
        
        toast({
          title: "Error Saving Assessment",
          description: "There was a problem saving your assessment. Please contact support.",
          variant: "destructive",
        });
      }
    };

    evaluateAndSave();
  }, [candidateName, candidatePosition, completedPrompts, aptitudeScore, aptitudeTotal]);
  
  return (
    <div className="assessment-card max-w-4xl mx-auto text-center">
      <SuccessHeader candidateName={candidateName} />
      
      <SubmissionDetails 
        isSaving={isSaving} 
        submissionId={submissionId} 
        evaluationStatus={evaluationStatus} 
      />
      
      <CandidateInformation 
        candidateName={candidateName} 
        candidatePosition={candidatePosition} 
      />
      
      <Button 
        className="hirescribe-button"
        onClick={restartAssessment}
      >
        Start New Assessment
      </Button>
    </div>
  );
};

export default AssessmentComplete;
