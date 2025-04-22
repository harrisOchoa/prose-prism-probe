import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { AptitudeQuestion } from "@/utils/aptitudeQuestions";
import AssessmentTimer from "./AssessmentTimer";
import useAptitudeAntiCheating from "@/hooks/useAptitudeAntiCheating";
import ProgressIndicator from "./assessment/ProgressIndicator";

interface AptitudeTestProps {
  questions: AptitudeQuestion[];
  onComplete: (answers: number[], score: number, antiCheatingMetrics?: any) => void;
  timeLimit: number; // in seconds
}

/** Randomize array items without mutating original */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** For each question, randomize its options and keep correct answer mapping */
function randomizeQuestionsAndOptions(questions: AptitudeQuestion[]) {
  return questions.map((q) => {
    // Shuffle options and map correctAnswer index accordingly
    const indexedOptions = q.options.map((opt, idx) => ({ text: opt, origIndex: idx }));
    const shuffledOptions = shuffleArray(indexedOptions);
    const newCorrectIndex = shuffledOptions.findIndex((opt) => opt.origIndex === q.correctAnswer);
    return {
      ...q,
      options: shuffledOptions.map((opt) => opt.text),
      correctAnswer: newCorrectIndex,
    };
  });
}

const AptitudeTest = ({ questions, onComplete, timeLimit }: AptitudeTestProps) => {
  // Use useMemo to randomize only once per mount
  const randomizedQuestions = useMemo(() => randomizeQuestionsAndOptions(shuffleArray(questions)), [questions]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>(Array(randomizedQuestions.length).fill(-1));

  // --- Anti-cheating hook for tab switches & copy prevention ---
  const {
    preventCopy,
    getAptitudeAntiCheatingMetrics,
    tabSwitches,
    suspiciousActivity,
    copyAttempts,
    resetMetrics,
  } = useAptitudeAntiCheating();

  const containerRef = useRef<HTMLDivElement>(null);

  // Attach copy prevention to question/options container
  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;
    containerEl.addEventListener("copy", preventCopy as EventListener);

    // Optionally, prevent cut
    containerEl.addEventListener("cut", preventCopy as EventListener);

    return () => {
      containerEl.removeEventListener("copy", preventCopy as EventListener);
      containerEl.removeEventListener("cut", preventCopy as EventListener);
    };
  }, [preventCopy]);

  // Optionally reset anti-cheating if test restarts (not required here)
  // useEffect(() => { resetMetrics(); }, [questions]);

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

    if (currentQuestionIndex < randomizedQuestions.length - 1) {
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
    const unansweredQuestions = selectedOptions.findIndex((option) => option === -1);
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
    for (let i = 0; i < randomizedQuestions.length; i++) {
      if (selectedOptions[i] === randomizedQuestions[i].correctAnswer) {
        score++;
      }
    }

    // Submit the test with anti-cheating metrics
    onComplete(selectedOptions, score, getAptitudeAntiCheatingMetrics());
  };

  const handleTimeEnd = () => {
    toast({
      title: "Time's up!",
      description: "Your test has been automatically submitted.",
    });
    submitTest();
  };

  const currentQuestion = randomizedQuestions[currentQuestionIndex];

  return (
    <div className="assessment-card max-w-4xl mx-auto">
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="assessment-title">Aptitude Test</h1>
          <AssessmentTimer duration={timeLimit} onTimeEnd={handleTimeEnd} />
        </div>
        
        <ProgressIndicator 
          currentStep={currentQuestionIndex + 1} 
          totalSteps={randomizedQuestions.length}
          label="Aptitude Progress"
        />
      </div>

      <div className="flex items-center mb-4 text-sm font-medium text-assessment-accent">
        <span className="bg-assessment-accent/10 rounded-full px-3 py-1">
          Question {currentQuestionIndex + 1} of {randomizedQuestions.length}
        </span>
        {/* Optionally display tab switches & copy attempts live for admins */}
        <span className="ml-auto text-xs text-gray-400 flex gap-3">
          <span>Tab switches: {tabSwitches}</span>
          <span>Copy attempts: {copyAttempts}</span>
        </span>
      </div>

      {/* Prevent copying from this card */}
      <Card
        className="mb-6 p-6 select-none"
        ref={containerRef}
        tabIndex={-1}
        style={{ userSelect: "none" }}
        aria-label="Aptitude Question (copying disabled)"
      >
        <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`p-3 rounded-md border cursor-pointer transition-colors ${
                selectedOptions[currentQuestionIndex] === index
                  ? "bg-assessment-primary text-white border-assessment-primary"
                  : "bg-white hover:bg-gray-50 border-gray-200"
              }`}
              onClick={() => handleOptionSelect(index)}
              // Extra: Prevent text copy on options
              style={{ userSelect: "none" }}
              tabIndex={-1}
              aria-label={`Option ${String.fromCharCode(65 + index)} (copying disabled)`}
            >
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                    selectedOptions[currentQuestionIndex] === index
                      ? "bg-white text-assessment-primary"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
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
            {currentQuestionIndex + 1} of {randomizedQuestions.length}
          </span>
        </div>

        <Button onClick={handleNext}>
          {currentQuestionIndex < randomizedQuestions.length - 1 ? "Next" : "Submit Test"}
        </Button>
      </div>
    </div>
  );
};

export default AptitudeTest;
