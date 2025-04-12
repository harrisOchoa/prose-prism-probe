
import React from "react";

interface CandidateInformationProps {
  candidateName: string;
  candidatePosition: string;
}

const CandidateInformation = ({ candidateName, candidatePosition }: CandidateInformationProps) => {
  return (
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
  );
};

export default CandidateInformation;
