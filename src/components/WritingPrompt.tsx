
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AssessmentTimer from "@/components/AssessmentTimer";
import { useAntiCheating } from "@/hooks/useAntiCheating";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, AlertTriangle, Check, Eye, EyeOff } from "lucide-react";
import ProgressIndicator from "./assessment/ProgressIndicator";
import { Progress } from "@/components/ui/progress";
import { memo } from "react";

interface WritingPromptProps {
  prompt: string;
  response: string;
  timeLimit: number;
  onSubmit: (text: string, metrics?: any) => void;
  currentQuestion: number;
  totalQuestions: number;
  isLoading?: boolean;
}

const WritingPrompt: React.FC<WritingPromptProps> = memo(({
  prompt,
  response,
  timeLimit,
  onSubmit,
  currentQuestion,
  totalQuestions,
  isLoading = false
}) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFocusWarning, setShowFocusWarning] = useState(false);
  const isMobile = useIsMobile();
  
  const {
    handleKeyPress,
    preventCopyPaste,
    getAssessmentMetrics,
    tabSwitches,
    windowBlurs,
    suspiciousActivity
  } = useAntiCheating(text);

  useEffect(() => {
    // Show warning when window blurs occur
    if (windowBlurs > 0) {
      setShowFocusWarning(true);
      
      // Show toast when user switches away
      toast({
        title: "Focus lost",
        description: "Switching away from this assessment is being tracked and may be flagged as suspicious.",
        variant: "destructive",
      });
      
      // Hide warning after 5 seconds
      const timer = setTimeout(() => {
        setShowFocusWarning(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [windowBlurs]);

  // Memoize word count percentage calculation
  const wordCountPercentage = useMemo(() => {
    return Math.min(100, (wordCount / 50) * 100);
  }, [wordCount]);

  // Memoize progress bar color based on word count
  const getProgressColor = useMemo(() => {
    if (wordCount < 30) return "#ef4444"; // red
    if (wordCount < 50) return "#f59e0b"; // amber
    return "#10b981"; // green
  }, [wordCount]);

  // Memoize whether the user has reached minimum word count
  const hasMinimumWords = useMemo(() => wordCount >= 50, [wordCount]);

  // Memoized text change handler for better performance
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  useEffect(() => {
    // Calculate word count and character count
    const words = text.trim().split(/\s+/).filter(word => word !== "");
    setWordCount(words.length);
    setCharCount(text.length);

    // Auto-resize textarea based on content (if needed)
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.max(textarea.scrollHeight, isMobile ? 192 : 256); // min height
      textarea.style.height = `${Math.min(newHeight, 500)}px`; // max height 500px
    }
  }, [text, isMobile]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setText(response || "");
  }, [response, currentQuestion]);

  const handleSubmit = useCallback(async () => {
    if (wordCount < 50) {
      toast({
        title: "Response too short",
        description: "Please write at least 50 words to submit your assessment.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Getting assessment metrics before submission");
      const metrics = getAssessmentMetrics();
      console.log("Anti-cheating metrics captured:", metrics);
      
      // Add additional tracking metric for debugging
      localStorage.setItem(`prompt-${currentQuestion}-submitted`, "true");
      localStorage.setItem(`writing-metrics-captured`, JSON.stringify(metrics));
      
      // Submit the response with metrics
      await onSubmit(text, metrics);
    } catch (error) {
      console.error("Error capturing metrics during submission:", error);
      // If metrics capturing fails, still submit the response
      await onSubmit(text, null);
    } finally {
      setIsSubmitting(false);
    }
  }, [text, wordCount, currentQuestion, getAssessmentMetrics, onSubmit]);

  return (
    <div className="container max-w-4xl mx-auto py-3 md:py-6 px-3 md:px-0 animate-fade-in">
      <Card className="border shadow-md transition-all">
        <CardHeader className={`bg-muted/50 ${isMobile ? 'p-3' : 'p-6'}`}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className={`${isMobile ? 'text-lg' : 'text-2xl'}`}>
                Writing Assessment
              </CardTitle>
              <AssessmentTimer duration={timeLimit} onTimeEnd={handleSubmit} />
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
          
          {showFocusWarning && (
            <div className="mb-4 p-3 text-sm flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-md">
              <EyeOff className="h-4 w-4 text-amber-600" />
              <span className="text-amber-800">
                <strong>Focus tracking active:</strong> Leaving this window or switching tabs is being monitored and may be flagged as suspicious activity.
              </span>
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>Your Response:</h3>
              <div className={`text-xs sm:text-sm ${hasMinimumWords ? 'text-green-600' : 'text-amber-600'}`}>
                {wordCount}/50 words minimum
              </div>
            </div>
            
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyPress}
              onCopy={preventCopyPaste}
              onPaste={preventCopyPaste}
              onCut={preventCopyPaste}
              className={`w-full transition-all ${isMobile ? 'min-h-[12rem]' : 'min-h-[16rem]'} p-3 md:p-4 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none text-sm md:text-base`}
              placeholder="Start typing your response here..."
              disabled={isLoading || isSubmitting}
              style={{ resize: 'vertical' }}
            />
            
            <div className="mt-2">
              <Progress value={wordCountPercentage} color={getProgressColor} className="h-2" />
              <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                <span>{charCount} characters</span>
                <span>{wordCount} words</span>
              </div>
            </div>
            
            {suspiciousActivity && (
              <div className="mt-3 text-amber-600 text-sm flex items-center gap-1.5 bg-amber-50 p-2 rounded-md border border-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <span>Suspicious activity detected. Your submission will be flagged for review.</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3">
            <Button 
              onClick={handleSubmit} 
              size={isMobile ? "default" : "lg"}
              className="w-full sm:w-auto"
              disabled={isLoading || isSubmitting || wordCount < 50}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Submitting...
                </>
              ) : hasMinimumWords ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Submit Response
                </>
              ) : (
                "Submit Response"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

WritingPrompt.displayName = "WritingPrompt";

export default WritingPrompt;
