
import React, { useRef, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import WordCounter from "./WordCounter";
import { useIsMobile } from "@/hooks/use-mobile";

interface WritingResponseInputProps {
  text: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  preventCopyPaste: (e: React.ClipboardEvent) => void;
  wordCount: number;
  charCount: number;
  disabled: boolean;
  suspiciousActivity: boolean;
}

const WritingResponseInput: React.FC<WritingResponseInputProps> = ({
  text,
  onChange,
  onKeyDown,
  preventCopyPaste,
  wordCount,
  charCount,
  disabled,
  suspiciousActivity
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  useEffect(() => {
    // Auto-resize textarea based on content
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.max(textarea.scrollHeight, isMobile ? 192 : 256); // min height
      textarea.style.height = `${Math.min(newHeight, 500)}px`; // max height 500px
    }
  }, [text, isMobile]);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>Your Response:</h3>
        <div className={`text-xs sm:text-sm ${wordCount >= 50 ? 'text-green-600' : 'text-amber-600'}`}>
          {wordCount}/50 words minimum
        </div>
      </div>
      
      <textarea
        ref={textareaRef}
        value={text}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onCopy={preventCopyPaste}
        onPaste={preventCopyPaste}
        onCut={preventCopyPaste}
        className={`w-full transition-all ${isMobile ? 'min-h-[12rem]' : 'min-h-[16rem]'} p-3 md:p-4 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none text-sm md:text-base`}
        placeholder="Start typing your response here..."
        disabled={disabled}
        style={{ resize: 'vertical' }}
      />
      
      <WordCounter 
        wordCount={wordCount}
        charCount={charCount}
        minWords={50}
      />
      
      {suspiciousActivity && (
        <div className="mt-3 text-amber-600 text-sm flex items-center gap-1.5 bg-amber-50 p-2 rounded-md border border-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <span>Suspicious activity detected. Your submission will be flagged for review.</span>
        </div>
      )}
    </div>
  );
};

export default WritingResponseInput;
