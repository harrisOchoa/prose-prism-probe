
import CandidateForm from './assessment-intro/CandidateForm';
import Instructions from './assessment-intro/Instructions';

interface AssessmentIntroProps {
  step: "info" | "instructions";
  candidateName: string;
  candidatePosition?: string;
  onInfoSubmit?: (name: string, position: string, skills: string) => void;
  onStart?: () => void;
}

const AssessmentIntro = ({ 
  step, 
  candidateName, 
  candidatePosition = "", 
  onInfoSubmit, 
  onStart 
}: AssessmentIntroProps) => {
  return (
    <div className="assessment-card max-w-4xl mx-auto">
      <h1 className="assessment-title text-center text-assessment-accent mb-6">Candidate Assessment</h1>
      
      {step === "info" && onInfoSubmit && (
        <CandidateForm
          candidateName={candidateName}
          candidatePosition={candidatePosition}
          onSubmit={onInfoSubmit}
        />
      )}
      
      {step === "instructions" && onStart && (
        <Instructions
          candidateName={candidateName}
          onStart={onStart}
        />
      )}
    </div>
  );
};

export default AssessmentIntro;
