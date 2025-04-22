
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SubmissionDetailsProps {
  isSaving: boolean;
  submissionId: string | null;
  evaluationStatus: "loading" | "complete" | "error";
  savingMessage: string;
}

const SubmissionDetails = ({ 
  isSaving, 
  submissionId, 
  evaluationStatus,
  savingMessage 
}: SubmissionDetailsProps) => {
  return (
    <Card className="mb-8 p-6 bg-gray-50">
      {isSaving ? (
        <div className="flex flex-col items-center justify-center py-6 animate-fade-in">
          <Loader2 className="h-8 w-8 animate-spin text-hirescribe-primary mb-2" />
          <p className="text-hirescribe-primary">
            {savingMessage}
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Submission Details</h2>
          
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
  );
};

export default SubmissionDetails;
