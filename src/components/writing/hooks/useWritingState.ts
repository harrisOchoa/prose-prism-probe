
import { useState, useEffect, useCallback } from "react";

export const useWritingState = (initialResponse: string, currentQuestion: number) => {
  const [text, setText] = useState(initialResponse || "");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate word count and character count only when text changes
  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word !== "");
    setWordCount(words.length);
    setCharCount(text.length);
  }, [text]);
  
  // Update response when the prop changes (new question)
  useEffect(() => {
    setText(initialResponse || "");
  }, [initialResponse, currentQuestion]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  return {
    text,
    setText,
    wordCount,
    charCount,
    isSubmitting,
    setIsSubmitting,
    handleTextChange
  };
};
