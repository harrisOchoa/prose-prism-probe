
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Users, CheckCircle } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="assessment-card max-w-4xl mx-auto text-center">
      <h1 className="assessment-title text-center text-hirescribe-primary mb-6">HireScribe</h1>
      <div className="bg-hirescribe-muted p-6 rounded-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Welcome to our Assessment Platform</h2>
        <p className="mb-6">
          HireScribe guides you through a comprehensive assessment process designed to be fair and accessible to all candidates:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-center mb-3">
              <CheckCircle className="text-hirescribe-primary h-6 w-6 mr-2" />
              <h3 className="font-semibold text-hirescribe-primary">Aptitude Test</h3>
            </div>
            <p className="text-gray-700">A 30-question assessment with general knowledge questions that everyone can relate to</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-center mb-3">
              <FileText className="text-hirescribe-primary h-6 w-6 mr-2" />
              <h3 className="font-semibold text-hirescribe-primary">Writing Assessment</h3>
            </div>
            <p className="text-gray-700">A series of writing prompts designed to be relevant to all life experiences and backgrounds</p>
          </div>
        </div>
        <p className="text-gray-700 mb-6">
          The entire assessment will take approximately 75 minutes to complete. Please ensure you have a quiet environment 
          and uninterrupted time before beginning.
        </p>
      </div>
      <div className="text-center">
        <Button 
          className="hirescribe-button text-lg px-8 py-4"
          onClick={onStart}
        >
          Start Assessment
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
