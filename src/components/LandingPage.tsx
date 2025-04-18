
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Users, CheckCircle, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="assessment-card max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-hirescribe-primary bg-gradient-to-r from-hirescribe-primary to-hirescribe-accent bg-clip-text text-transparent">
            HireScribe
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome to our intelligent assessment platform, designed to evaluate candidates fairly and comprehensively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-effect p-6 rounded-xl hover:shadow-elevation-2 transition-all duration-300">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-hirescribe-primary/10 p-3">
                <FileText className="h-6 w-6 text-hirescribe-primary" />
              </div>
              <h3 className="font-semibold text-lg">Writing Assessment</h3>
              <p className="text-muted-foreground text-sm">
                Demonstrate your written communication skills through thoughtful responses
              </p>
            </div>
          </div>

          <div className="glass-effect p-6 rounded-xl hover:shadow-elevation-2 transition-all duration-300">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-hirescribe-accent/10 p-3">
                <CheckCircle className="h-6 w-6 text-hirescribe-accent" />
              </div>
              <h3 className="font-semibold text-lg">Aptitude Test</h3>
              <p className="text-muted-foreground text-sm">
                Show your problem-solving abilities with our carefully curated questions
              </p>
            </div>
          </div>

          <div className="glass-effect p-6 rounded-xl hover:shadow-elevation-2 transition-all duration-300">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-hirescribe-secondary/10 p-3">
                <Users className="h-6 w-6 text-hirescribe-secondary" />
              </div>
              <h3 className="font-semibold text-lg">Fair Evaluation</h3>
              <p className="text-muted-foreground text-sm">
                Get assessed through an unbiased and comprehensive process
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <Button 
            onClick={onStart}
            className="bg-gradient-to-r from-hirescribe-primary to-hirescribe-accent hover:opacity-90 transition-all duration-300 text-white px-8 py-6 text-lg rounded-xl group"
          >
            Start Assessment
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground pt-4">
          Time required: approximately 60 minutes
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
