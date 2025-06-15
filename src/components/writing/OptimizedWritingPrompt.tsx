
import React, { useMemo, useCallback, memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAntiCheating } from "@/hooks/useAntiCheating";
import { useIsMobile } from "@/hooks/use-mobile";
import { shallowEqual } from "@/utils/shallowCompare";

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

const OptimizedWritingPrompt: React.FC<WritingPromptProps> = memo(({
  prompt,
  response,
  timeLimit,
  onSubmit,
  currentQuestion,
  totalQuestions,
  isLoading = false
}) => {
  const isMobile = useIsMobile();
  
  // Extract writing state management with memoization
  const {
    text,
    wordCount,
    charCount,
    isSubmitting,
    setIsSubmitting,
    handleTextChange
  } = useWritingState(response, currentQuestion);
  
  // Extract anti-cheating functionality with memoization
  const antiCheatingData = useAntiCheating(text);
  const {
    handleKeyPress,
    preventCopyPaste,
    getAssessmentMetrics,
    tabSwitches,
    windowBlurs,
    suspiciousActivity
  } = antiCheatingData;

  // Extract focus warning logic with memoization
  const { showFocusWarning } = useFocusWarning(windowBlurs);

  // Memoize submission handler to prevent recreation
  const memoizedOnSubmit = useCallback(onSubmit, [onSubmit]);

  // Extract submission logic with memoized callback
  const { handleSubmit } = useWritingSubmission({
    text,
    wordCount,
    currentQuestion,
    getAssessmentMetrics,
    onSubmit: memoizedOnSubmit,
    setIsSubmitting
  });

  // Memoize whether the user has reached minimum word count
  const hasMinimumWords = useMemo(() => wordCount >= 50, [wordCount]);

  // Memoize container classes
  const containerClasses = useMemo(() => 
    "container max-w-4xl mx-auto py-3 md:py-6 px-3 md:px-0 animate-fade-in",
    []
  );

  const headerPadding = useMemo(() => 
    `bg-muted/50 ${isMobile ? 'p-3' : 'p-6'}`,
    [isMobile]
  );

  const contentPadding = useMemo(() => 
    `${isMobile ? 'p-3 pt-4' : 'p-6 pt-6'}`,
    [isMobile]
  );

  return (
    <div className={containerClasses}>
      <Card className="border shadow-md transition-all">
        <CardHeader className={headerPadding}>
          <WritingHeader 
            timeLimit={timeLimit}
            onTimeEnd={handleSubmit}
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
          />
        </CardHeader>
        <CardContent className={contentPadding}>
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
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.prompt === nextProps.prompt &&
    prevProps.response === nextProps.response &&
    prevProps.timeLimit === nextProps.timeLimit &&
    prevProps.currentQuestion === nextProps.currentQuestion &&
    prevProps.totalQuestions === nextProps.totalQuestions &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.onSubmit === nextProps.onSubmit
  );
});

OptimizedWritingPrompt.displayName = "OptimizedWritingPrompt";

export default OptimizedWritingPrompt;
