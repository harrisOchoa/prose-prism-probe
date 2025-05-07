
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmissionErrorProps {
  error: string;
  onRetry: () => void;
  isRetrying: boolean;
}

const SubmissionError: React.FC<SubmissionErrorProps> = ({ error, onRetry, isRetrying }) => {
  return (
    <div className="text-center">
      <p className="text-red-600 mb-4">
        There was an error submitting your assessment: {error}
      </p>
      <Button 
        onClick={onRetry}
        variant="default"
        className="min-w-[200px] mb-2"
        disabled={isRetrying}
      >
        {isRetrying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Retrying...
          </>
        ) : (
          "Retry Submission"
        )}
      </Button>
    </div>
  );
};

export default SubmissionError;
