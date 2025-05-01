
import React from "react";
import { Separator } from "@/components/ui/separator";

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 brand-heading">Terms of Service</h1>
      <Separator className="my-4" />
      
      <div className="space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">1. Agreement to Terms</h2>
          <p>
            By accessing or using the HireScribe assessment platform, you agree to be bound by these Terms of Service
            and our Privacy Policy. If you disagree with any part of the terms, you do not have permission
            to access the service.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">2. Service Description</h2>
          <p>
            HireScribe provides an assessment platform designed to evaluate candidate skills, aptitude, 
            and writing abilities. Our service includes aptitude tests, writing prompts, and comprehensive
            analysis tools for hiring teams to make informed decisions.
          </p>
          <p className="mt-2">
            Candidates do not need to create an account to take assessments. Instead, they provide
            necessary information at the beginning of the assessment process when invited by an organization.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">3. Use of Services</h2>
          <p>
            You agree to use the service only for lawful purposes and in accordance with these Terms.
          </p>
          <p className="mt-2">
            You are prohibited from:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Using the service for any illegal purpose</li>
            <li>Attempting to gain unauthorized access to any part of our platform</li>
            <li>Interfering with or disrupting the service</li>
            <li>Scraping or collecting data from our platform without permission</li>
            <li>Sharing assessment links with unauthorized individuals</li>
            <li>Using unauthorized aids or assistance during assessments</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4. Assessment Integrity</h2>
          <p>
            Our platform includes anti-cheating measures to ensure the integrity of assessments. By using our service,
            you consent to these measures, which may include browser focus tracking, keyboard pattern analysis,
            and other activity monitoring during the assessment.
          </p>
          <p className="mt-2">
            Attempting to circumvent these measures or engaging in dishonest practices during an assessment
            violates these Terms and may result in invalidation of assessment results.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">5. Intellectual Property</h2>
          <p>
            The HireScribe platform and its original content, features, and functionality are owned
            by HireScribe and are protected by international copyright, trademark, and other
            intellectual property laws.
          </p>
          <p className="mt-2">
            Assessment questions, prompts, and evaluation methodologies are proprietary. You may not
            reproduce, distribute, or create derivative works based on our assessments without express permission.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">6. Data Privacy</h2>
          <p>
            Your use of our service is also governed by our Privacy Policy, which describes how we collect,
            use, and share information. By using HireScribe, you consent to our data practices as described
            in the Privacy Policy.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">7. Limitation of Liability</h2>
          <p>
            In no event shall HireScribe, its directors, employees, partners, agents, suppliers, or
            affiliates, be liable for any indirect, incidental, special, consequential, or punitive
            damages, including without limitation, loss of profits, data, use, goodwill, or other
            intangible losses resulting from:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Your use or inability to use the service</li>
            <li>Any decisions made based on assessment results</li>
            <li>Unauthorized access to or alteration of your data</li>
            <li>Technical issues that may affect assessment performance</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">8. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
            in which HireScribe operates, without regard to its conflict of law provisions.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will provide notice of any
            significant changes by updating the "Last Updated" date at the bottom of these Terms.
          </p>
          <p className="mt-2">
            Last Updated: May 1, 2025
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:{" "}
            <a href="mailto:harrisdochoa@gmail.com" className="text-hirescribe-primary hover:underline">
              harrisdochoa@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
