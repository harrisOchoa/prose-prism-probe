
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const Privacy = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-elevation-1">
        <CardHeader className={`${isMobile ? 'p-4' : 'p-6'} bg-muted/30`}>
          <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} gradient-text`}>
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="prose max-w-none">
            <p>Last updated: April 30, 2025</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
            <p>
              This Privacy Policy explains how HireScribe ("we", "us", or "our") collects, uses, and shares your 
              information when you use our assessment platform and services.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">2. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, 
              complete assessments, or contact support. This includes:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Contact information (name, email address)</li>
              <li>Assessment responses and results</li>
              <li>Performance metrics and analytics</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">3. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide and improve our services</li>
              <li>Process assessment results</li>
              <li>Communicate with you about your account or our services</li>
              <li>Monitor and analyze trends and usage of our services</li>
            </ul>
            
            <p className="mt-8">
              For more information about our privacy practices or if you have questions, please contact us.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Privacy;
