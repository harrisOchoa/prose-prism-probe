
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { saveAssessmentResult } from "@/firebase/assessmentService";
import { toast } from "@/hooks/use-toast";

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
  const aptitudePercentage = aptitudeTotal > 0 ? Math.round((aptitudeScore / aptitudeTotal) * 100) : 0;
  const [isSaving, setIsSaving] = useState(true);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    const saveResults = async () => {
      try {
        const id = await saveAssessmentResult(
          candidateName,
          candidatePosition,
          completedPrompts,
          aptitudeScore,
          aptitudeTotal
        );
        
        setSubmissionId(id);
        setIsSaving(false);
        
        toast({
          title: "Assessment Saved",
          description: "Your assessment has been successfully saved.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error saving assessment:", error);
        setIsSaving(false);
        
        toast({
          title: "Error Saving Assessment",
          description: "There was a problem saving your assessment. Please try again.",
          variant: "destructive",
        });
      }
    };

    saveResults();
  }, [candidateName, candidatePosition, completedPrompts, aptitudeScore, aptitudeTotal]);
  
  return (
    <div className="assessment-card max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-assessment-success/20 p-3">
          <CheckCircle className="h-12 w-12 text-assessment-success" />
        </div>
      </div>
      
      <h1 className="assessment-title mb-4">Assessment Submitted Successfully</h1>
      <p className="text-xl text-gray-600 mb-8">
        Thank you for completing the assessment, {candidateName}!
      </p>
      
      <Card className="mb-8 p-6 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Assessment Results</h2>
        {isSaving ? (
          <p className="text-hirescribe-primary">Saving your results...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-500 text-sm">Aptitude Score</p>
                <p className="text-3xl font-bold text-hirescribe-primary">{aptitudeScore}/{aptitudeTotal}</p>
                <p className="text-sm text-gray-500">{aptitudePercentage}%</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-500 text-sm">Writing - Word Count</p>
                <p className="text-3xl font-bold text-hirescribe-primary">{wordCount}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-500 text-sm">Submission Time</p>
                <p className="text-3xl font-bold text-hirescribe-primary">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <p className="text-gray-500 text-sm mb-2">Submission Date</p>
              <p className="text-xl font-bold text-hirescribe-primary">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            
            {submissionId && (
              <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                <p className="text-gray-500 text-sm mb-2">Reference ID</p>
                <p className="text-xl font-semibold text-hirescribe-primary">
                  {submissionId}
                </p>
              </div>
            )}
          </>
        )}
      </Card>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Candidate Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm text-left">
            <p className="text-gray-500 text-sm">Full Name</p>
            <p className="text-xl font-semibold text-hirescribe-primary">{candidateName}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-left">
            <p className="text-gray-500 text-sm">Position Applied For</p>
            <p className="text-xl font-semibold text-hirescribe-primary">{candidatePosition}</p>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">What Happens Next?</h2>
        <p className="text-gray-700 mb-4">
          Your assessment will be reviewed by our team. The evaluation typically takes 1-2 business days.
          You will receive feedback on your aptitude test and writing skills via email.
        </p>
      </div>
      
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
