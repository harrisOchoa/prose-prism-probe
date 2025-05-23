
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAntiCheating } from "@/hooks/useAntiCheating";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { memo } from "react";

import WritingHeader from "./WritingHeader";
import WritingInstructions from "./WritingInstructions";
import FocusWarning from "./FocusWarning";
import WritingResponseInput from "./WritingResponseInput";
import WritingControls from "./WritingControls";

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
  const [text, setText] = useState(response || "");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFocusWarning, setShowFocusWarning] = useState(false);
  const isMobile = useIsMobile();
  
  // Extract anti-cheating functionality
  const {
    handleKeyPress,
    preventCopyPaste,
    getAssessmentMetrics,
    tabSwitches,
    windowBlurs,
    suspiciousActivity
  } = useAntiCheating(text);

  // Calculate word count and character count only when text changes
  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word !== "");
    setWordCount(words.length);
    setCharCount(text.length);
  }, [text]);
  
  // Update response when the prop changes (new question)
  useEffect(() => {
    setText(response || "");
  }, [response, currentQuestion]);

  // Update metrics periodically but avoid state updates - using stable reference
  const updateMetricsRef = useCallback(() => {
    // Just log metrics without state updates
    const metrics = getAssessmentMetrics();
    console.log("Current anti-cheating metrics:", metrics);
  }, [getAssessmentMetrics]);
  
  // Set up metrics tracking interval with stable callback
  useEffect(() => {
    const intervalId = setInterval(updateMetricsRef, 5000);
    return () => clearInterval(intervalId);
  }, [updateMetricsRef]);

  // Only show warning when windowBlurs changes
  useEffect(() => {
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

  // Memoize whether the user has reached minimum word count
  const hasMinimumWords = useMemo(() => wordCount >= 50, [wordCount]);

  // The key fix: Don't call handleKeyPress directly in onChange, which was causing the infinite loop
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // We don't call handleKeyPress here anymore, as it's handled in onKeyDown
  }, []);

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
      
      // Create a copy to avoid modifying the original metrics
      const metricsToSubmit = {...metrics};
      
      // Force calculate words per minute based on text length and time
      if (metricsToSubmit && (!metricsToSubmit.wordsPerMinute || metricsToSubmit.wordsPerMinute === 0)) {
        const estimatedWPM = Math.max(1, Math.min(120, wordCount / (metricsToSubmit.timeSpentMs / 60000)));
        metricsToSubmit.wordsPerMinute = Math.round(estimatedWPM);
        console.log("Estimated WPM:", metricsToSubmit.wordsPerMinute);
      }
      
      // Add additional tracking metric for debugging
      localStorage.setItem(`prompt-${currentQuestion}-submitted`, "true");
      localStorage.setItem(`writing-metrics-captured`, JSON.stringify(metricsToSubmit));
      
      // Submit the response with metrics
      await onSubmit(text, metricsToSubmit);
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
          <WritingHeader 
            timeLimit={timeLimit}
            onTimeEnd={handleSubmit}
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
          />
        </CardHeader>
        <CardContent className={`${isMobile ? 'p-3 pt-4' : 'p-6 pt-6'}`}>
          <WritingInstructions prompt={prompt} isLoading={isLoading} />
          
          <FocusWarning visible={showFocusWarning} />
          
          <WritingResponseInput
            text={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyPress}
            preventCopyPaste={preventCopyPaste}
            wordCount={wordCount}
            charCount={charCount}
            disabled={isLoading || isSubmitting}
            suspiciousActivity={suspiciousActivity}
          />
          
          <WritingControls 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isDisabled={isLoading}
            hasMinimumWords={hasMinimumWords}
          />
        </CardContent>
      </Card>
    </div>
  );
});

WritingPrompt.displayName = "WritingPrompt";

export default WritingPrompt;
