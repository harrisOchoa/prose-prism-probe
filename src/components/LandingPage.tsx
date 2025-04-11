
import React from "react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="assessment-card max-w-4xl mx-auto text-center">
      <h1 className="assessment-title text-center text-assessment-accent mb-6">Candidate Assessment Platform</h1>
      <div className="bg-assessment-muted p-6 rounded-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Welcome to our Assessment Platform</h2>
        <p className="mb-6">
          This platform will guide you through a comprehensive assessment process consisting of:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-assessment-primary mb-2">Aptitude Test</h3>
            <p className="text-gray-700">A 30-question assessment to evaluate your critical thinking skills</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-assessment-primary mb-2">Writing Assessment</h3>
            <p className="text-gray-700">A series of writing prompts to showcase your communication abilities</p>
          </div>
        </div>
        <p className="text-gray-700 mb-6">
          The entire assessment will take approximately 75 minutes to complete. Please ensure you have a quiet environment 
          and uninterrupted time before beginning.
        </p>
      </div>
      <div className="text-center">
        <Button 
          className="assessment-button text-lg px-8 py-4"
          onClick={onStart}
        >
          Start Assessment
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
