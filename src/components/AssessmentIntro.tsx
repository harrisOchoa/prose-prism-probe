
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AssessmentIntroProps {
  onStart: (name: string, position: string) => void;
}

const AssessmentIntro = ({ onStart }: AssessmentIntroProps) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [formError, setFormError] = useState(false);
  
  const faqItems = [
    {
      id: "purpose",
      question: "What is the purpose of this assessment?",
      answer: "This assessment is designed to evaluate your English writing skills, including grammar, vocabulary, coherence, and ability to express ideas clearly in a professional context."
    },
    {
      id: "time",
      question: "How long does the assessment take?",
      answer: "The assessment has a 30-minute time limit. This includes reading the prompt and writing your response."
    },
    {
      id: "format",
      question: "What is the format of the assessment?",
      answer: "You will be presented with a writing prompt. You need to write a coherent and well-structured response to the prompt within the time limit."
    },
    {
      id: "criteria",
      question: "How will I be evaluated?",
      answer: "Your response will be evaluated based on content, organization, vocabulary usage, grammar accuracy, and overall clarity of communication."
    }
  ];
  
  const toggleFaq = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
    }
  };
  
  const handleStartAssessment = () => {
    if (name.trim() === "" || position.trim() === "") {
      setFormError(true);
      return;
    }
    
    setFormError(false);
    onStart(name, position);
  };
  
  return (
    <div className="assessment-card max-w-4xl mx-auto">
      <h1 className="assessment-title text-center text-assessment-accent mb-6">Writing Skills Assessment</h1>
      
      <div className="bg-assessment-muted p-6 rounded-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Candidate Information</h2>
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
        </div>
      </div>
      
      <div className="bg-assessment-muted p-6 rounded-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">1</span>
            <span>You will be given a writing prompt related to professional communication.</span>
          </li>
          <li className="flex items-start">
            <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
            <span>You have 30 minutes to complete your response.</span>
          </li>
          <li className="flex items-start">
            <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
            <span>Aim for 300-500 words to fully demonstrate your writing abilities.</span>
          </li>
          <li className="flex items-start">
            <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">4</span>
            <span>Your response will be evaluated on clarity, organization, grammar, vocabulary, and relevance to the prompt.</span>
          </li>
        </ul>
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
          onClick={handleStartAssessment}
        >
          Begin Assessment
        </Button>
      </div>
    </div>
  );
};

export default AssessmentIntro;
