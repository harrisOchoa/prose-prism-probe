
import React, { useMemo } from "react";
import { Progress } from "@/components/ui/progress";

interface WordCounterProps {
  wordCount: number;
  charCount: number;
  minWords?: number;
  showSuspiciousActivity?: boolean;
}

const WordCounter: React.FC<WordCounterProps> = ({
  wordCount, 
  charCount, 
  minWords = 50,
  showSuspiciousActivity = false
}) => {
  // Memoize word count percentage calculation
  const wordCountPercentage = useMemo(() => {
    return Math.min(100, (wordCount / minWords) * 100);
  }, [wordCount, minWords]);

  // Memoize progress bar color based on word count
  const getProgressColor = useMemo(() => {
    if (wordCount < Math.floor(minWords * 0.6)) return "#ef4444"; // red
    if (wordCount < minWords) return "#f59e0b"; // amber
    return "#10b981"; // green
  }, [wordCount, minWords]);
  
  return (
    <div className="mt-2">
      <Progress value={wordCountPercentage} color={getProgressColor} className="h-2" />
      <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
        <span>{charCount} characters</span>
        <span>{wordCount} words</span>
      </div>
    </div>
  );
};

export default WordCounter;
