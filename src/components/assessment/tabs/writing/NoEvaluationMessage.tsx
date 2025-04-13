
import React from "react";
import { AlertCircle } from "lucide-react";

const NoEvaluationMessage: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-6 bg-amber-50 rounded-lg">
      <div className="flex flex-col items-center text-center">
        <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
        <h3 className="text-lg font-medium text-amber-800 mb-1">No AI Evaluation Available</h3>
        <p className="text-amber-700 max-w-md">
          The AI has not evaluated this assessment's writing yet. Use the "Evaluate Writing" button at the top of the page to start the evaluation process.
        </p>
      </div>
    </div>
  );
};

export default NoEvaluationMessage;
