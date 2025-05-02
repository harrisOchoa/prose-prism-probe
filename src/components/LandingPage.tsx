
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, ArrowRight, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage = ({ onStart }: LandingPageProps) => {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    console.log("LandingPage component mounted");
  }, []);
  
  return (
    <div className="flex flex-col min-h-[80vh]">
      {/* Hero Section */}
      <div className="brand-section flex items-center justify-center p-4 sm:p-6">
        <div className="assessment-card max-w-4xl mx-auto text-center space-y-6 md:space-y-8 animate-fade-in w-full">
          <div className="space-y-4 md:space-y-6">
            <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} brand-heading`}>
              HireScribe Assessment
            </h1>
            <p className={`${isMobile ? 'text-base' : 'text-xl'} text-muted-foreground max-w-2xl mx-auto px-2`}>
              Welcome to your assessment. This platform is designed to evaluate your aptitude and writing skills.
            </p>
          </div>

          {/* Feature Cards */}
          <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}>
            <div className="glass-effect p-4 md:p-6 rounded-xl hover:shadow-elevation-2 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col items-center gap-3 md:gap-4">
                <div className="rounded-full bg-hirescribe-primary/10 p-3">
                  <FileText className="h-5 w-5 md:h-6 md:w-6 text-hirescribe-primary" />
                </div>
                <h3 className="font-semibold text-base md:text-lg">Writing Assessment</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Demonstrate your written communication skills through thoughtful responses
                </p>
              </div>
            </div>

            <div className="glass-effect p-4 md:p-6 rounded-xl hover:shadow-elevation-2 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col items-center gap-3 md:gap-4">
                <div className="rounded-full bg-hirescribe-accent/10 p-3">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-hirescribe-accent" />
                </div>
                <h3 className="font-semibold text-base md:text-lg">Aptitude Test</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Show your problem-solving abilities with our carefully curated questions
                </p>
              </div>
            </div>

            <div className="glass-effect p-4 md:p-6 rounded-xl hover:shadow-elevation-2 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col items-center gap-3 md:gap-4">
                <div className="rounded-full bg-hirescribe-secondary/10 p-3">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-hirescribe-secondary" />
                </div>
                <h3 className="font-semibold text-base md:text-lg">Time Management</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Complete the assessment sections within the allocated time frames
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="pt-4 md:pt-8 w-full">
            <Button 
              onClick={onStart}
              className={`bg-gradient-to-r from-hirescribe-primary to-hirescribe-accent hover:opacity-90 transition-all duration-300 text-white ${isMobile ? 'px-6 py-3 text-sm rounded-lg w-full' : 'px-8 py-6 text-lg rounded-xl w-auto'} group`}
            >
              Start Assessment
              <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground pt-2 md:pt-4`}>
            Time required: approximately 60 minutes
          </p>
        </div>
      </div>
      
      {/* Assessment Information Section */}
      <div className="brand-section bg-muted/50 py-12 md:py-16" id="about">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} brand-heading mb-4`}>
              Assessment Overview
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              This assessment consists of two main sections designed to evaluate your skills and abilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="brand-card p-6">
              <div className="rounded-full bg-hirescribe-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-hirescribe-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aptitude Section</h3>
              <p className="text-muted-foreground">
                Multiple-choice questions testing logical reasoning, numerical skills, and problem-solving abilities. 
                Allow approximately 30 minutes for this section.
              </p>
            </div>
            
            <div className="brand-card p-6">
              <div className="rounded-full bg-hirescribe-accent/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-hirescribe-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Writing Section</h3>
              <p className="text-muted-foreground">
                Written responses to professional prompts that assess your communication skills, critical thinking, 
                and ability to articulate ideas clearly. Allow approximately 30 minutes for this section.
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-6 brand-card">
            <div className="flex items-start">
              <div className="rounded-full bg-hirescribe-secondary/10 p-3 w-12 h-12 flex items-center justify-center mr-4">
                <Clock className="h-6 w-6 text-hirescribe-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Read each question and prompt carefully before responding</li>
                  <li>• Manage your time efficiently between sections</li>
                  <li>• Answer questions to the best of your ability</li>
                  <li>• Provide thoughtful and detailed written responses</li>
                  <li>• Review your answers before submission when possible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
