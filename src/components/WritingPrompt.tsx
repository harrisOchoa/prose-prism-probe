
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AssessmentTimer from "@/components/AssessmentTimer";
import { useAntiCheating } from "@/hooks/useAntiCheating";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, Save } from "lucide-react";
import ProgressIndicator from "./assessment/ProgressIndicator";
import { useSessionRecovery } from "@/hooks/useSessionRecovery";
import ResumeSessionDialog from "./assessment/ResumeSessionDialog";

interface WritingPromptProps {
  prompt: string;
  response: string;
  timeLimit: number;
  onSubmit: (text: string, metrics?: any) => void;
  currentQuestion: number;
  totalQuestions: number;
  isLoading?: boolean;
}

const WritingPrompt: React.FC<WritingPromptProps> = ({
  prompt,
  response,
  timeLimit,
  onSubmit,
  currentQuestion,
  totalQuestions,
  isLoading = false
}) => {
  const [text, setText] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const isMobile = useIsMobile();
  
  const {
    handleKeyPress,
    preventCopyPaste,
    getAssessmentMetrics,
    tabSwitches,
    suspiciousActivity
  } = useAntiCheating(text);
  
  // Initialize session recovery - here we store just the text response
  const { 
    hasExistingSession, 
    saveSessionData, 
    clearSessionData, 
    resumeSession, 
    declineResume,
    sessionData 
  } = useSessionRecovery('writing', totalQuestions);

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word !== "");
    setWordCount(words.length);
  }, [text]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setText(response || "");
  }, [response, currentQuestion]);
  
  // Save progress to localStorage every 30 seconds or after 100 characters typed
  const [lastLength, setLastLength] = useState(text.length);
  useEffect(() => {
    // If text changed by more than 100 characters since last save
    if (Math.abs(text.length - lastLength) > 100) {
      saveText();
      setLastLength(text.length);
    }
    
    // Auto-save timer
    const saveInterval = setInterval(() => {
      if (text.trim()) {
        saveText();
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [text]);
  
  // Save text when the window loses focus
  useEffect(() => {
    const handleBlur = () => {
      if (text.trim()) {
        saveText();
      }
    };

    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [text]);
  
  // Function to save text
  const saveText = () => {
    const dummyAnswers = new Array(totalQuestions).fill(-1);
    saveSessionData(currentQuestion - 1, dummyAnswers, false, text);
    setLastSaved(new Date());
  };

  const handleSubmit = () => {
    if (wordCount < 50) {
      toast({
        title: "Response too short",
        description: "Please write at least 50 words to submit your assessment.",
        variant: "destructive",
      });
      return;
    }
    
    const metrics = getAssessmentMetrics();
    
    console.log("Anti-cheating metrics captured:", metrics);
    
    // Mark the session as completed and clear it
    const dummyAnswers = new Array(totalQuestions).fill(-1);
    saveSessionData(currentQuestion - 1, dummyAnswers, true, text);
    clearSessionData();
    
    onSubmit(text, metrics);
  };
  
  // Handle session resumption
  const handleResumeSession = () => {
    const resumedData = resumeSession();
    if (resumedData) {
      setText(resumedData.textResponse || "");
      toast({
        title: "Session Resumed",
        description: "Your previous writing has been restored.",
      });
    }
  };
  
  // Custom save button handler
  const handleManualSave = () => {
    saveText();
    toast({
      title: "Progress Saved",
      description: "Your response has been saved. You can safely resume later if needed.",
    });
  };

  // Show the resume session dialog if there's an existing session
  if (hasExistingSession && sessionData && sessionData.textResponse) {
    return (
      <ResumeSessionDialog 
        open={true}
        onResume={handleResumeSession}
        onDecline={declineResume}
        sessionType="writing"
        progress={{
          current: currentQuestion,
          total: totalQuestions
        }}
      />
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-3 md:py-6 px-3 md:px-0">
      <Card className="border shadow">
        <CardHeader className={`bg-muted/50 ${isMobile ? 'p-3' : 'p-6'}`}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className={`${isMobile ? 'text-lg' : 'text-2xl'}`}>
                Writing Assessment
              </CardTitle>
              <AssessmentTimer 
                duration={timeLimit} 
                onTimeEnd={handleSubmit}
                persistKey={`writing_timer_${currentQuestion}`}
              />
            </div>
            <ProgressIndicator 
              currentStep={currentQuestion} 
              totalSteps={totalQuestions}
              label="Writing Progress"
            />
          </div>
        </CardHeader>
        <CardContent className={`${isMobile ? 'p-3 pt-4' : 'p-6 pt-6'}`}>
          <div className={`mb-4 ${isMobile ? 'p-3' : 'p-4'} bg-muted/30 rounded-md`}>
            <h3 className={`font-medium ${isMobile ? 'text-base' : 'text-lg'} mb-2`}>Prompt:</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <p>Generating a position-specific writing prompt...</p>
              </div>
            ) : (
              <p className={isMobile ? 'text-sm' : 'text-base'}>{prompt}</p>
            )}
          </div>
          
          <div className="mb-4">
            <h3 className={`font-medium ${isMobile ? 'text-base' : 'text-lg'} mb-2`}>Your Response:</h3>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              onCopy={preventCopyPaste}
              onPaste={preventCopyPaste}
              onCut={preventCopyPaste}
              className={`w-full ${isMobile ? 'h-48' : 'h-64'} p-3 md:p-4 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none text-sm md:text-base`}
              placeholder="Start typing your response here..."
              disabled={isLoading}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto order-2 sm:order-1">
              <div className={`text-xs sm:text-sm ${wordCount < 50 ? 'text-red-500' : 'text-green-500'}`}>
                Word count: {wordCount} {wordCount < 50 && "(minimum 50 words)"}
              </div>
              
              {lastSaved && (
                <div className="text-xs text-muted-foreground">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualSave}
                className="flex items-center gap-1"
              >
                <Save className="h-3 w-3" /> Save
              </Button>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              size={isMobile ? "default" : "lg"}
              className="w-full sm:w-auto order-1 sm:order-2"
              disabled={isLoading}
            >
              Submit Response
            </Button>
          </div>
          
          {isMobile && (
            <div className="mt-4 text-center text-xs text-muted-foreground">
              Progress is automatically saved every 30 seconds
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WritingPrompt;
