
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AssessmentTimer from "@/components/AssessmentTimer";
import { useAntiCheating } from "@/hooks/useAntiCheating";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface WritingPromptProps {
  prompt: string;
  response: string;
  timeLimit: number;
  onSubmit: (text: string, metrics?: any) => void;
  currentQuestion: number;
  totalQuestions: number;
}

const WritingPrompt: React.FC<WritingPromptProps> = ({
  prompt,
  response,
  timeLimit,
  onSubmit,
  currentQuestion,
  totalQuestions,
}) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const isMobile = useIsMobile();
  
  // Initialize anti-cheating hooks
  const {
    handleKeyPress,
    preventCopyPaste,
    getAssessmentMetrics,
    tabSwitches,
    suspiciousActivity
  } = useAntiCheating(text);

  // Update word count when text changes
  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word !== "");
    setWordCount(words.length);
  }, [text]);

  // Focus the textarea on component mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Update text with response only on first mount or currentQuestion change
  useEffect(() => {
    setText(response || "");
  }, [response, currentQuestion]);

  const handleSubmit = () => {
    if (wordCount < 50) {
      toast({
        title: "Response too short",
        description: "Please write at least 50 words to submit your assessment.",
        variant: "destructive",
      });
      return;
    }
    
    // Include anti-cheating metrics with the submission
    const metrics = getAssessmentMetrics();
    
    // Log metrics to ensure they're being captured
    console.log("Anti-cheating metrics captured:", metrics);
    
    onSubmit(text, metrics);
  };

  return (
    <div className="container max-w-4xl mx-auto py-3 md:py-6 px-3 md:px-0">
      <Card className="border shadow">
        <CardHeader className={`bg-muted/50 ${isMobile ? 'p-3' : 'p-6'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className={`${isMobile ? 'text-lg' : 'text-2xl'}`}>
              Writing ({currentQuestion}/{totalQuestions})
            </CardTitle>
            <AssessmentTimer duration={timeLimit} onTimeEnd={handleSubmit} />
          </div>
        </CardHeader>
        <CardContent className={`${isMobile ? 'p-3 pt-4' : 'p-6 pt-6'}`}>
          <div className={`mb-4 ${isMobile ? 'p-3' : 'p-4'} bg-muted/30 rounded-md`}>
            <h3 className={`font-medium ${isMobile ? 'text-base' : 'text-lg'} mb-2`}>Prompt:</h3>
            <p className={isMobile ? 'text-sm' : 'text-base'}>{prompt}</p>
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
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className={`text-xs sm:text-sm ${wordCount < 50 ? 'text-red-500' : 'text-green-500'} order-2 sm:order-1`}>
              Word count: {wordCount} {wordCount < 50 && "(minimum 50 words)"}
            </div>
            
            <Button 
              onClick={handleSubmit} 
              size={isMobile ? "default" : "lg"}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Submit Response
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WritingPrompt;
