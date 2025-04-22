
import { Button } from "@/components/ui/button";
import FAQSection from "./FAQSection";

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
              <span className={isMobile ? 'text-sm' : ''}>You will be given 30 multiple-choice questions testing various aptitude skills.</span>
            </li>
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
              <span className={isMobile ? 'text-sm' : ''}>You have 30 minutes to complete all questions.</span>
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
              <span className={isMobile ? 'text-sm' : ''}>You will be given multiple writing prompts related to professional communication.</span>
            </li>
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
              <span className={isMobile ? 'text-sm' : ''}>You have 30 minutes to complete all writing prompts.</span>
            </li>
            <li className="flex items-start">
              <span className="bg-assessment-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
              <span className={isMobile ? 'text-sm' : ''}>Aim for 300-500 words per prompt to fully demonstrate your writing abilities.</span>
            </li>
          </ul>
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
