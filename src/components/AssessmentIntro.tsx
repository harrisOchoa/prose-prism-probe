
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface AssessmentIntroProps {
  step: "info" | "instructions";
  candidateName: string;
  candidatePosition?: string;
  onInfoSubmit?: (name: string, position: string, skills: string) => void;
  onStart?: () => void;
}

const AssessmentIntro = ({ 
  step, 
  candidateName, 
  candidatePosition = "", 
  onInfoSubmit, 
  onStart 
}: AssessmentIntroProps) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [name, setName] = useState(candidateName);
  const [position, setPosition] = useState(candidatePosition);
  const [skills, setSkills] = useState("");
  const [formError, setFormError] = useState(false);
  
  const faqItems = [
    {
      id: "purpose",
      question: "What is the purpose of this assessment?",
      answer: "This assessment is designed to evaluate both your logical reasoning skills through an aptitude test and your English writing abilities through a written assessment."
    },
    {
      id: "time",
      question: "How long does the assessment take?",
      answer: "The complete assessment takes approximately 60 minutes: 30 minutes for the aptitude test and 30 minutes for the writing assessment."
    },
    {
      id: "format",
      question: "What is the format of the assessment?",
      answer: "The assessment consists of two parts: a 30-question aptitude test followed by a writing assessment with multiple writing prompts."
    },
    {
      id: "criteria",
      question: "How will I be evaluated?",
      answer: "Your aptitude test will be scored based on correct answers. Your writing will be evaluated based on content, organization, vocabulary usage, grammar accuracy, and overall clarity of communication."
    }
  ];
  
  const toggleFaq = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
    }
  };
  
  const handleInfoSubmit = () => {
    if (name.trim() === "" || position.trim() === "" || skills.trim() === "") {
      setFormError(true);
      return;
    }
    
    setFormError(false);
    onInfoSubmit?.(name, position, skills);
  };

  if (step === "info") {
    return (
      <div className="assessment-card max-w-4xl mx-auto">
        <h1 className="assessment-title text-center text-assessment-accent mb-6">Candidate Assessment</h1>
        
        <div className="bg-assessment-muted p-6 rounded-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
          <p className="mb-6">
            Thank you for taking the time to complete our candidate assessment. 
            Before we begin, please provide the following information:
          </p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={formError && name.trim() === "" ? "border-assessment-danger" : ""}
              />
              {formError && name.trim() === "" && (
                <p className="text-assessment-danger text-sm mt-1">Please enter your full name</p>
              )}
            </div>
            <div>
              <Label htmlFor="position">Position Applied For</Label>
              <Input 
                id="position" 
                placeholder="Enter the position you are applying for"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className={formError && position.trim() === "" ? "border-assessment-danger" : ""}
              />
              {formError && position.trim() === "" && (
                <p className="text-assessment-danger text-sm mt-1">Please enter the position</p>
              )}
            </div>
            <div>
              <Label htmlFor="skills">Relevant Skills & Experience</Label>
              <Textarea
                id="skills"
                placeholder="Describe your key skills, experience, and expertise relevant to this position"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className={`min-h-[120px] ${formError && skills.trim() === "" ? "border-assessment-danger" : ""}`}
              />
              {formError && skills.trim() === "" && (
                <p className="text-assessment-danger text-sm mt-1">Please describe your relevant skills and experience</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                This helps us generate questions tailored to your experience level and expertise
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            className="assessment-button text-lg px-8 py-4"
            onClick={handleInfoSubmit}
          >
            Continue to Instructions
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="assessment-card max-w-4xl mx-auto">
      <h1 className="assessment-title text-center text-assessment-accent mb-6">Candidate Assessment</h1>
      
      <div className="bg-assessment-muted p-6 rounded-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <p className="mb-4">Hello {candidateName}, welcome to your assessment.</p>
        <p className="mb-4">This assessment consists of two parts:</p>
        
        <div className="mb-6 bg-white p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2 text-assessment-primary">Part 1: Aptitude Test</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">1</span>
              <span>You will be given 30 multiple-choice questions testing various aptitude skills.</span>
            </li>
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
              <span>You have 30 minutes to complete all questions.</span>
            </li>
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
              <span>You can navigate between questions and review your answers before final submission.</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2 text-assessment-primary">Part 2: Writing Assessment</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">1</span>
              <span>You will be given multiple writing prompts related to professional communication.</span>
            </li>
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
              <span>You have 30 minutes to complete all writing prompts.</span>
            </li>
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
              <span>Aim for 300-500 words per prompt to fully demonstrate your writing abilities.</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <div key={item.id} className="border rounded-md overflow-hidden">
              <button 
                className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => toggleFaq(item.id)}
              >
                <span className="font-medium">{item.question}</span>
                <svg 
                  className={`w-5 h-5 transform transition-transform ${expanded === item.id ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expanded === item.id && (
                <div className="p-4 bg-gray-50 border-t animate-slide-up">
                  <p className="text-gray-700">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center">
        <Button 
          className="assessment-button text-lg px-8 py-4"
          onClick={onStart}
        >
          Begin Assessment
        </Button>
      </div>
    </div>
  );
};

export default AssessmentIntro;
