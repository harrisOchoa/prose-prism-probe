
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface AssessmentCompleteProps {
  wordCount: number;
  candidateName: string;
  candidatePosition: string;
  restartAssessment: () => void;
}

const AssessmentComplete = ({ wordCount, candidateName, candidatePosition, restartAssessment }: AssessmentCompleteProps) => {
  return (
    <div className="assessment-card max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-assessment-success/20 p-3">
          <CheckCircle className="h-12 w-12 text-assessment-success" />
        </div>
      </div>
      
      <h1 className="assessment-title mb-4">Assessment Submitted Successfully</h1>
      <p className="text-xl text-gray-600 mb-8">
        Thank you for completing the writing assessment, {candidateName}!
      </p>
      
      <Card className="mb-8 p-6 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Response Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Word Count</p>
            <p className="text-3xl font-bold text-assessment-primary">{wordCount}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Submission Time</p>
            <p className="text-3xl font-bold text-assessment-primary">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Submission Date</p>
            <p className="text-3xl font-bold text-assessment-primary">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Candidate Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm text-left">
            <p className="text-gray-500 text-sm">Full Name</p>
            <p className="text-xl font-semibold text-assessment-primary">{candidateName}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-left">
            <p className="text-gray-500 text-sm">Position Applied For</p>
            <p className="text-xl font-semibold text-assessment-primary">{candidatePosition}</p>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">What Happens Next?</h2>
        <p className="text-gray-700 mb-4">
          Your assessment will be reviewed by our team. The evaluation typically takes 1-2 business days.
          You will receive feedback on your writing skills via email.
        </p>
      </div>
      
      <Button 
        className="assessment-button"
        onClick={restartAssessment}
      >
        Start New Assessment
      </Button>
    </div>
  );
};

export default AssessmentComplete;
