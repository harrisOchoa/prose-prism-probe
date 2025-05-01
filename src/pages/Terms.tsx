
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
            By accessing or using the HireScribe platform, you agree to be bound by these Terms of Service
            and our Privacy Policy. If you disagree with any part of the terms, you do not have permission
            to access the service.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">2. Use of Services</h2>
          <p>
            HireScribe provides an assessment platform to evaluate candidate skills and abilities.
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
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">3. Intellectual Property</h2>
          <p>
            The HireScribe platform and its original content, features, and functionality are owned
            by HireScribe and are protected by international copyright, trademark, and other
            intellectual property laws.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4. User Accounts</h2>
          <p>
            When you create an account with us, you guarantee that the information you provide is
            accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete
            information may result in the termination of your account.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">5. Limitation of Liability</h2>
          <p>
            In no event shall HireScribe, its directors, employees, partners, agents, suppliers, or
            affiliates, be liable for any indirect, incidental, special, consequential, or punitive
            damages, including without limitation, loss of profits, data, use, goodwill, or other
            intangible losses.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">6. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
            in which HireScribe operates, without regard to its conflict of law provisions.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will provide notice of any
            significant changes by updating the "Last Updated" date at the bottom of these Terms.
          </p>
          <p className="mt-2">
            Last Updated: May 1, 2025
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">8. Contact Us</h2>
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
