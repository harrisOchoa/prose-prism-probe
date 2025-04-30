
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const Terms = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-elevation-1">
        <CardHeader className={`${isMobile ? 'p-4' : 'p-6'} bg-muted/30`}>
          <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} gradient-text`}>
            Terms of Service
          </CardTitle>
        </CardHeader>
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="prose max-w-none">
            <p>Last updated: April 30, 2025</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing or using the HireScribe assessment platform, you agree to be bound by these Terms of Service.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">2. Account Registration</h2>
            <p>
              When you create an account with us, you must provide accurate information. You are responsible for 
              maintaining the security of your account.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">3. Assessment Integrity</h2>
            <p>
              Users are expected to complete assessments honestly and independently. Attempting to manipulate 
              assessment results or using unauthorized assistance is prohibited.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">4. Intellectual Property</h2>
            <p>
              The Service and its content, features, and functionality are owned by HireScribe and are protected by 
              copyright, trademark, and other intellectual property laws.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">5. Termination</h2>
            <p>
              We may terminate or suspend your account at our sole discretion, without notice, for conduct that 
              we determine violates these Terms of Service.
            </p>
            
            <p className="mt-8">
              If you have any questions about these Terms, please contact us.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Terms;
