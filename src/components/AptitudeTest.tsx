
import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { AptitudeQuestion } from "@/utils/aptitudeQuestions";
import AssessmentTimer from "./AssessmentTimer";
import useAptitudeAntiCheating from "@/hooks/useAptitudeAntiCheating";
import ProgressIndicator from "./assessment/ProgressIndicator";
import QuestionHeader from "./aptitude/QuestionHeader";
import OptionsList from "./aptitude/OptionsList";
import NavigationButtons from "./aptitude/NavigationButtons";
import ResumeSessionDialog from "./assessment/ResumeSessionDialog";
import { useSessionRecovery } from "@/hooks/useSessionRecovery";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const randomizedQuestions = useMemo(() => randomizeQuestionsAndOptions(shuffleArray(questions)), [questions]);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>(Array(randomizedQuestions.length).fill(-1));
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Initialize session recovery
  const { 
    hasExistingSession, 
    saveSessionData, 
    clearSessionData, 
    resumeSession, 
    declineResume,
    sessionData 
  } = useSessionRecovery('aptitude', randomizedQuestions.length);
  
  const {
    preventCopy,
    getAptitudeAntiCheatingMetrics
  } = useAptitudeAntiCheating();

  // Use a ref instead of creating a DOM element directly
  const containerRef = useRef<HTMLDivElement>(null);

  // Save progress to localStorage every 10 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (currentQuestionIndex >= 0) {
        saveSessionData(currentQuestionIndex, selectedOptions);
      }
    }, 10000);

    return () => clearInterval(saveInterval);
  }, [currentQuestionIndex, selectedOptions]);

  // Save progress on window blur (when user switches tabs or apps)
  useEffect(() => {
    const handleBlur = () => {
      saveSessionData(currentQuestionIndex, selectedOptions);
    };

    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [currentQuestionIndex, selectedOptions]);

  // Handle session resumption
  const handleResumeSession = () => {
    const resumedData = resumeSession();
    if (resumedData) {
      setCurrentQuestionIndex(resumedData.currentQuestionIndex);
      setSelectedOptions(resumedData.selectedOptions);
      toast({
        title: "Session Resumed",
        description: `You've resumed from question ${resumedData.currentQuestionIndex + 1}.`,
      });
    }
  };

  // Set up anti-cheating on the current ref when it's available
  useMemo(() => {
    const currentElement = containerRef.current;
    if (currentElement) {
      currentElement.addEventListener('copy', preventCopy as EventListener);
      currentElement.addEventListener('cut', preventCopy as EventListener);
      
      // Clean up function
      return () => {
        currentElement.removeEventListener('copy', preventCopy as EventListener);
        currentElement.removeEventListener('cut', preventCopy as EventListener);
      };
    }
  }, [containerRef.current, preventCopy]);

  const handleOptionSelect = (optionIndex: number) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[currentQuestionIndex] = optionIndex;
    setSelectedOptions(updatedOptions);
    
    // Save progress after each answer
    saveSessionData(currentQuestionIndex, updatedOptions);
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
      // Save progress after moving to next question
      saveSessionData(currentQuestionIndex + 1, selectedOptions);
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

    let score = 0;
    for (let i = 0; i < randomizedQuestions.length; i++) {
      if (selectedOptions[i] === randomizedQuestions[i].correctAnswer) {
        score++;
      }
    }

    // Log the score and answer information before submitting
    console.log("Submitting aptitude test with score:", score, "out of", randomizedQuestions.length);
    console.log("Selected answers:", selectedOptions);
    
    // Mark the session as completed and clear it
    saveSessionData(currentQuestionIndex, selectedOptions, true);
    clearSessionData();
    
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
  
  // Calculate progress percentage for the progress bar
  const progressPercentage = ((currentQuestionIndex + 1) / randomizedQuestions.length) * 100;
  
  // Determine color based on progress
  const getProgressColor = () => {
    if (progressPercentage < 33) return "#3b82f6"; // blue-500
    if (progressPercentage < 66) return "#8b5cf6"; // purple-500
    return "#22c55e"; // green-500
  };

  // Show the resume session dialog if there's an existing session
  if (hasExistingSession && sessionData) {
    return (
      <ResumeSessionDialog 
        open={true}
        onResume={handleResumeSession}
        onDecline={declineResume}
        sessionType="aptitude"
        progress={{
          current: sessionData.currentIndex + 1,
          total: randomizedQuestions.length
        }}
      />
    );
  }

  return (
    <div className="assessment-card max-w-4xl mx-auto">
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="assessment-title">Aptitude Test</h1>
          <AssessmentTimer 
            duration={timeLimit} 
            onTimeEnd={handleTimeEnd} 
            persistKey="aptitude_timer" 
          />
        </div>
        
        <ProgressIndicator 
          currentStep={currentQuestionIndex + 1} 
          totalSteps={randomizedQuestions.length}
          label="Aptitude Progress"
          color={getProgressColor()}
        />
      </div>

      <QuestionHeader 
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={randomizedQuestions.length}
      />

      <Card
        className="mb-6 p-6 select-none"
        ref={containerRef}
        tabIndex={-1}
        style={{ userSelect: "none" }}
        aria-label="Aptitude Question (copying disabled)"
      >
        <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
        <OptionsList 
          options={currentQuestion.options}
          selectedOption={selectedOptions[currentQuestionIndex]}
          onSelect={handleOptionSelect}
        />
      </Card>

      <NavigationButtons 
        currentQuestion={currentQuestionIndex}
        totalQuestions={randomizedQuestions.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      {isMobile && (
        <div className="fixed bottom-4 left-4 right-4 bg-background/70 backdrop-blur-sm p-2 rounded-lg border shadow-md">
          <div className="text-center text-sm">
            <span className="font-medium">Progress saved</span> - You can safely resume if connection is lost
          </div>
        </div>
      )}
    </div>
  );
};

export default AptitudeTest;
