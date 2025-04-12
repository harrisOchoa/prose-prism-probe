
import { CheckCircle } from "lucide-react";

interface SuccessHeaderProps {
  candidateName: string;
}

const SuccessHeader = ({ candidateName }: SuccessHeaderProps) => {
  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-assessment-success/20 p-3">
          <CheckCircle className="h-12 w-12 text-assessment-success" />
        </div>
      </div>
      
      <h1 className="assessment-title mb-4">Assessment Submitted Successfully</h1>
      <p className="text-xl text-gray-600 mb-8">
        Thank you for completing the assessment, {candidateName}!
      </p>
    </>
  );
};

export default SuccessHeader;
