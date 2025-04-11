
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { AptitudeQuestion } from "@/utils/aptitudeQuestions";
import AssessmentTimer from "./AssessmentTimer";

interface AptitudeTestProps {
  questions: AptitudeQuestion[];
  onComplete: (answers: number[], score: number) => void;
  timeLimit: number; // in seconds
}

const AptitudeTest = ({ questions, onComplete, timeLimit }: AptitudeTestProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>(Array(questions.length).fill(-1));
  
  const handleOptionSelect = (optionIndex: number) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[currentQuestionIndex] = optionIndex;
    setSelectedOptions(updatedOptions);
  };
  
  const handleNext = () => {
    if (selectedOptions[currentQuestionIndex] === -1) {
      toast({
        title: "Please select an answer",
        description: "You must select an option before moving to the next question.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitTest();
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const submitTest = () => {
    // Check if all questions are answered
    const unansweredQuestions = selectedOptions.findIndex(option => option === -1);
    if (unansweredQuestions !== -1) {
      toast({
        title: "Incomplete test",
        description: `Question ${unansweredQuestions + 1} is not answered. Please answer all questions.`,
        variant: "destructive",
      });
      setCurrentQuestionIndex(unansweredQuestions);
      return;
    }
    
    // Calculate score
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      if (selectedOptions[i] === questions[i].correctAnswer) {
        score++;
      }
    }
    
    // Submit the test
    onComplete(selectedOptions, score);
  };
  
  const handleTimeEnd = () => {
    toast({
      title: "Time's up!",
      description: "Your test has been automatically submitted.",
    });
    submitTest();
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="assessment-card max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="assessment-title">Aptitude Test</h1>
        <AssessmentTimer duration={timeLimit} onTimeEnd={handleTimeEnd} />
      </div>
      
      <div className="flex items-center mb-4 text-sm font-medium text-assessment-accent">
        <span className="bg-assessment-accent/10 rounded-full px-3 py-1">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>
      
      <Card className="mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div 
              key={index}
              className={`p-3 rounded-md border cursor-pointer transition-colors ${
                selectedOptions[currentQuestionIndex] === index 
                  ? 'bg-assessment-primary text-white border-assessment-primary' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
              onClick={() => handleOptionSelect(index)}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                  selectedOptions[currentQuestionIndex] === index 
                    ? 'bg-white text-assessment-primary' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span>{option}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        
        <Button 
          onClick={handleNext}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Submit Test'}
        </Button>
      </div>
    </div>
  );
};

export default AptitudeTest;
