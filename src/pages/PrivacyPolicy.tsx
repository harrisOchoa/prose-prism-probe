
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
            <li>Create an account</li>
            <li>Complete an assessment</li>
            <li>Fill out forms</li>
            <li>Contact customer support</li>
          </ul>
          <p className="mt-2">
            This may include your name, email address, professional background, and assessment responses.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">3. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Provide, maintain, and improve our services</li>
            <li>Process and complete assessments</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information.
            However, no method of transmission over the Internet is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">5. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:{" "}
            <a href="mailto:harrisdochoa@gmail.com" className="text-hirescribe-primary hover:underline">
              harrisdochoa@gmail.com
            </a>
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">6. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          <p className="mt-2">
            Last Updated: May 1, 2025
          </p>
        </section>
      </div>
    </div>
  );
}
