
import React from "react";
import { Separator } from "@/components/ui/separator";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 brand-heading">About HireScribe</h1>
      <Separator className="my-4" />
      
      <div className="space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">Our Mission</h2>
          <p>
            HireScribe is an intelligent assessment platform designed to evaluate candidates fairly and comprehensively.
            Our mission is to transform the hiring process by providing objective, data-driven insights that help
            organizations make better hiring decisions while offering candidates a fair opportunity to showcase their abilities.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">What We Do</h2>
          <p>
            Our platform combines writing assessments and aptitude tests to provide a holistic view of candidate capabilities.
            We focus on:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Evaluating written communication skills through thoughtful prompts</li>
            <li>Assessing problem-solving abilities through carefully designed aptitude questions</li>
            <li>Providing detailed analysis of candidate performance and potential</li>
            <li>Ensuring assessment integrity through anti-cheating measures</li>
            <li>Delivering comprehensive insights to help hiring teams make informed decisions</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">How It Works</h2>
          <p>
            Our assessment process is straightforward:
          </p>
          <ol className="list-decimal ml-6 mt-2 space-y-2">
            <li>
              <strong>Invitation:</strong> Candidates receive an assessment invitation from a hiring organization.
            </li>
            <li>
              <strong>Candidate Information:</strong> Candidates provide basic information before starting the assessment.
            </li>
            <li>
              <strong>Aptitude Test:</strong> Candidates complete a series of questions designed to evaluate reasoning and problem-solving skills.
            </li>
            <li>
              <strong>Writing Assessment:</strong> Candidates respond to writing prompts relevant to the position they're applying for.
            </li>
            <li>
              <strong>Advanced Analysis:</strong> Our system analyzes responses and generates comprehensive insights.
            </li>
            <li>
              <strong>Results:</strong> Hiring teams receive detailed reports with candidate performance metrics and recommendations.
            </li>
          </ol>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">Our Technology</h2>
          <p>
            HireScribe leverages advanced technologies to provide accurate and insightful assessments:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Sophisticated writing evaluation algorithms that assess clarity, structure, and relevance</li>
            <li>Anti-cheating measures to ensure assessment integrity</li>
            <li>Data analytics that compare candidate performance against benchmarks</li>
            <li>Secure data handling with privacy as a priority</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">Our Commitment</h2>
          <p>
            We are committed to:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Fairness in candidate evaluation</li>
            <li>Privacy and security of all data</li>
            <li>Continuous improvement of our assessment methodologies</li>
            <li>Providing valuable insights that lead to better hiring decisions</li>
            <li>Helping organizations build stronger teams through informed selection</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
