
import React from "react";
import FAQSection from "@/components/assessment-intro/FAQSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const FAQ = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-elevation-1">
        <CardHeader className={`${isMobile ? 'p-4' : 'p-6'} bg-muted/30`}>
          <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} gradient-text`}>
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <FAQSection />
          
          <div className="mt-8">
            <h3 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'} mb-4`}>
              Still have questions?
            </h3>
            <p className="mb-4">
              If you couldn't find the answer to your question, please feel free to contact our support team.
            </p>
            <a 
              href="mailto:support@hirescribe.com" 
              className="text-hirescribe-primary hover:text-hirescribe-accent font-medium"
            >
              Contact Support
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQ;
