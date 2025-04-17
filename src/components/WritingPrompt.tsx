
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AssessmentTimer from "@/components/AssessmentTimer";
import { useAntiCheating } from "@/hooks/useAntiCheating";
import { toast } from "@/hooks/use-toast";

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
    <div className="container max-w-4xl mx-auto py-6">
      <Card className="border shadow">
        <CardHeader className="bg-muted/50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">
              Writing Assessment ({currentQuestion}/{totalQuestions})
            </CardTitle>
            <AssessmentTimer duration={timeLimit} onTimeEnd={handleSubmit} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 p-4 bg-muted/30 rounded-md">
            <h3 className="font-medium text-lg mb-2">Prompt:</h3>
            <p>{prompt}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-lg mb-2">Your Response:</h3>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              onCopy={preventCopyPaste}
              onPaste={preventCopyPaste}
              onCut={preventCopyPaste}
              className="w-full h-64 p-4 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
              placeholder="Start typing your response here..."
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className={`text-sm ${wordCount < 50 ? 'text-red-500' : 'text-green-500'}`}>
              Word count: {wordCount} {wordCount < 50 && "(minimum 50 words)"}
            </div>
            
            <Button onClick={handleSubmit} size="lg">
              Submit Response
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WritingPrompt;
