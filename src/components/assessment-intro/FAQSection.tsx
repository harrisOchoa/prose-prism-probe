
import { useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
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

const FAQSection = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const toggleFaq = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
    }
  };

  return (
    <div className={`mb-8 ${isMobile ? 'px-2' : ''}`}>
      <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqItems.map((item) => (
          <div key={item.id} className="border rounded-md overflow-hidden">
            <button 
              className={`w-full text-left p-3 md:p-4 flex justify-between items-center hover:bg-gray-50 transition-colors ${isMobile ? 'text-sm' : 'text-base'}`}
              onClick={() => toggleFaq(item.id)}
            >
              <span className="font-medium pr-2">{item.question}</span>
              <svg 
                className={`w-5 h-5 flex-shrink-0 transform transition-transform ${expanded === item.id ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expanded === item.id && (
              <div className="p-3 md:p-4 bg-gray-50 border-t">
                <p className={`text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;
