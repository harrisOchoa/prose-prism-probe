
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CandidateFormProps {
  candidateName: string;
  candidatePosition?: string;
  onSubmit: (name: string, position: string, skills: string) => void;
}

const CandidateForm = ({ candidateName, candidatePosition = "", onSubmit }: CandidateFormProps) => {
  const [name, setName] = useState(candidateName);
  const [position, setPosition] = useState(candidatePosition);
  const [skills, setSkills] = useState("");
  const [formError, setFormError] = useState(false);

  const handleSubmit = () => {
    if (name.trim() === "" || position.trim() === "" || skills.trim() === "") {
      setFormError(true);
      return;
    }
    
    setFormError(false);
    onSubmit(name, position, skills);
  };

  return (
    <div className="bg-assessment-muted p-6 rounded-md mb-8">
      <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
      <p className="mb-6">
        Thank you for taking the time to complete our candidate assessment. 
        Before we begin, please provide the following information:
      </p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input 
            id="fullName" 
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={formError && name.trim() === "" ? "border-assessment-danger" : ""}
          />
          {formError && name.trim() === "" && (
            <p className="text-assessment-danger text-sm mt-1">Please enter your full name</p>
          )}
        </div>
        <div>
          <Label htmlFor="position">Position Applied For</Label>
          <Input 
            id="position" 
            placeholder="Enter the position you are applying for"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className={formError && position.trim() === "" ? "border-assessment-danger" : ""}
          />
          {formError && position.trim() === "" && (
            <p className="text-assessment-danger text-sm mt-1">Please enter the position</p>
          )}
        </div>
        <div>
          <Label htmlFor="skills">Relevant Skills & Experience</Label>
          <Textarea
            id="skills"
            placeholder="Describe your key skills, experience, and expertise relevant to this position"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className={`min-h-[120px] ${formError && skills.trim() === "" ? "border-assessment-danger" : ""}`}
          />
          {formError && skills.trim() === "" && (
            <p className="text-assessment-danger text-sm mt-1">Please describe your relevant skills and experience</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            This helps us generate questions tailored to your experience level and expertise
          </p>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <Button 
          className="assessment-button text-lg px-8 py-4"
          onClick={handleSubmit}
        >
          Continue to Instructions
        </Button>
      </div>
    </div>
  );
};

export default CandidateForm;
