
import React, { useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAntiCheating } from "@/hooks/useAntiCheating";
import { useIsMobile } from "@/hooks/use-mobile";
import { memo } from "react";

import WritingHeader from "./WritingHeader";
import WritingInstructions from "./WritingInstructions";
import FocusWarning from "./FocusWarning";
import WritingResponseInput from "./WritingResponseInput";
import WritingControls from "./WritingControls";
import { useWritingState } from "./hooks/useWritingState";
import { useWritingSubmission } from "./hooks/useWritingSubmission";
import { useFocusWarning } from "./hooks/useFocusWarning";

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
  const isMobile = useIsMobile();
  
  // Extract writing state management
  const {
    text,
    wordCount,
    charCount,
    isSubmitting,
    setIsSubmitting,
    handleTextChange
  } = useWritingState(response, currentQuestion);
  
  // Extract anti-cheating functionality
  const {
    handleKeyPress,
    preventCopyPaste,
    getAssessmentMetrics,
    tabSwitches,
    windowBlurs,
    suspiciousActivity
  } = useAntiCheating(text);

  // Extract focus warning logic
  const { showFocusWarning } = useFocusWarning(windowBlurs);

  // Extract submission logic
  const { handleSubmit } = useWritingSubmission({
    text,
    wordCount,
    currentQuestion,
    getAssessmentMetrics,
    onSubmit,
    setIsSubmitting
  });

  // Memoize whether the user has reached minimum word count
  const hasMinimumWords = useMemo(() => wordCount >= 50, [wordCount]);

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
