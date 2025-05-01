
import React from "react";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 brand-heading">Privacy Policy</h1>
      <Separator className="my-4" />
      
      <div className="space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">1. Introduction</h2>
          <p>
            At HireScribe, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our assessment platform.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">2. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when you:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Complete an assessment</li>
            <li>Submit candidate information</li>
            <li>Fill out forms</li>
            <li>Contact customer support</li>
          </ul>
          <p className="mt-2">
            This may include your name, email address, professional background, and assessment responses.
            We do not require users to create accounts to take assessments; instead, candidates provide
            necessary information at the beginning of the assessment process.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">3. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Provide, maintain, and improve our assessment platform</li>
            <li>Process and evaluate assessment responses</li>
            <li>Generate insights and analytics for hiring teams</li>
            <li>Send necessary communications about the assessment</li>
            <li>Respond to your comments and questions</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4. Information Sharing</h2>
          <p>
            We share candidate assessment information only with the organization that requested the assessment.
            We do not sell your personal information to third parties. We may share anonymized, aggregated data
            for research and platform improvement purposes.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect candidate
            data and assessment responses. These include encryption, access controls, and regular security
            reviews. However, no method of transmission over the Internet is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">6. Data Retention</h2>
          <p>
            We retain assessment data for as long as necessary to fulfill the purposes outlined in this
            Privacy Policy, unless a longer retention period is required by law or requested by the
            organization that commissioned the assessment.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">7. Your Rights</h2>
          <p>
            Depending on your location, you may have rights regarding your personal data, including:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>The right to access and receive a copy of your data</li>
            <li>The right to rectify or update your data</li>
            <li>The right to delete your data (subject to certain exceptions)</li>
            <li>The right to restrict processing of your data</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, please contact us using the information provided below.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">8. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please contact us at:{" "}
            <a href="mailto:harrisdochoa@gmail.com" className="text-hirescribe-primary hover:underline">
              harrisdochoa@gmail.com
            </a>
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or for
            regulatory reasons. We will notify organizations using our platform of any significant changes.
          </p>
          <p className="mt-2">
            Last Updated: May 1, 2025
          </p>
        </section>
      </div>
    </div>
  );
}
