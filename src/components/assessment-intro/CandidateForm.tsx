
import React from 'react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface CandidateFormProps {
  candidateName: string;
  candidatePosition: string;
  onSubmit: (name: string, position: string, skills: string) => void;
}

const CandidateForm = ({ candidateName, candidatePosition, onSubmit }: CandidateFormProps) => {
  const [name, setName] = React.useState(candidateName);
  const [position, setPosition] = React.useState(candidatePosition);
  const [skills, setSkills] = React.useState("");
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, position, skills);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xl mx-auto">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hirescribe-primary"
          required
          placeholder="Enter your full name"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="position" className="block text-sm font-medium text-gray-700">
          Position Applied For
        </label>
        <input
          type="text"
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hirescribe-primary"
          required
          placeholder="Enter the position you're applying for"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
          Relevant Skills & Experience
        </label>
        <textarea
          id="skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hirescribe-primary min-h-[100px]"
          required
          placeholder="Describe your relevant skills and experience for this position"
        />
      </div>

      <Button 
        type="submit"
        className={`w-full ${isMobile ? 'py-3 text-base' : 'py-4 text-lg'}`}
      >
        Continue to Instructions
      </Button>
    </form>
  );
};

export default CandidateForm;
