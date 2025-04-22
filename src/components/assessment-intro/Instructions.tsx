
import { Button } from "@/components/ui/button";
import FAQSection from "./FAQSection";
import { useIsMobile } from "@/hooks/use-mobile";

interface InstructionsProps {
  candidateName: string;
  onStart: () => void;
}

const Instructions = ({ candidateName, onStart }: InstructionsProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      <div className={`bg-assessment-muted ${isMobile ? 'p-4' : 'p-6'} rounded-md mb-6 md:mb-8`}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>Instructions</h2>
        <p className="mb-4">Hello {candidateName}, welcome to your assessment.</p>
        <p className="mb-4">This assessment consists of two parts:</p>
        
        <div className={`mb-6 bg-white ${isMobile ? 'p-3' : 'p-4'} rounded-md`}>
          <h3 className="text-lg font-semibold mb-2 text-assessment-primary">Part 1: Aptitude Test</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">1</span>
              <div>
                <span className={isMobile ? 'text-sm' : ''}>You will be given 30 multiple-choice questions testing various aptitude skills.</span>
                <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                  <p className="font-medium mb-1">Example Question:</p>
                  <p className="mb-2">"If 3 workers can complete a task in 6 hours, how long would it take 6 workers to complete the same task?"</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2">
                    <li>A) 12 hours</li>
                    <li>B) 3 hours</li>
                    <li>C) 9 hours</li>
                    <li>D) 2 hours</li>
                  </ul>
                </div>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
              <div>
                <span className={isMobile ? 'text-sm' : ''}>You have 30 minutes to complete all questions. Questions cover:</span>
                <ul className="mt-1 list-disc list-inside text-gray-600 text-sm pl-4">
                  <li>Numerical Reasoning</li>
                  <li>Logical Thinking</li>
                  <li>Pattern Recognition</li>
                  <li>Problem Solving</li>
                </ul>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
              <span className={isMobile ? 'text-sm' : ''}>You can navigate between questions and review your answers before final submission.</span>
            </li>
          </ul>
        </div>
        
        <div className={`bg-white ${isMobile ? 'p-3' : 'p-4'} rounded-md`}>
          <h3 className="text-lg font-semibold mb-2 text-assessment-primary">Part 2: Writing Assessment</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">1</span>
              <div>
                <span className={isMobile ? 'text-sm' : ''}>You will be given multiple writing prompts related to professional communication.</span>
                <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                  <p className="font-medium mb-1">Example Prompt:</p>
                  <p>"Describe a challenging situation at work and how you resolved it. Include specific steps you took and what you learned from the experience."</p>
                </div>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
              <div>
                <span className={isMobile ? 'text-sm' : ''}>You have 30 minutes to complete all writing prompts. Your responses will be evaluated on:</span>
                <ul className="mt-1 list-disc list-inside text-gray-600 text-sm pl-4">
                  <li>Clarity and Organization</li>
                  <li>Grammar and Language Use</li>
                  <li>Depth of Analysis</li>
                  <li>Professional Communication</li>
                </ul>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
              <div>
                <span className={isMobile ? 'text-sm' : ''}>Aim for 300-500 words per prompt. A good response typically includes:</span>
                <ul className="mt-1 list-disc list-inside text-gray-600 text-sm pl-4">
                  <li>Clear introduction of the situation/topic</li>
                  <li>Specific examples and details</li>
                  <li>Your actions or analysis</li>
                  <li>Lessons learned or conclusions</li>
                </ul>
              </div>
            </li>
          </ul>

          <div className="mt-4 p-3 bg-gray-50 rounded-md border-l-4 border-assessment-primary">
            <p className="text-sm font-medium mb-1">Tips for Success:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Read each question/prompt carefully before answering</li>
              <li>Manage your time effectively between questions</li>
              <li>Review your answers before submission</li>
              <li>Provide specific examples in your writing responses</li>
            </ul>
          </div>
        </div>
      </div>
      
      <FAQSection />
      
      <div className="text-center">
        <Button 
          className={`assessment-button ${isMobile ? 'text-base px-6 py-3 w-full' : 'text-lg px-8 py-4'}`}
          onClick={onStart}
        >
          Begin Assessment
        </Button>
      </div>
    </>
  );
};

export default Instructions;
