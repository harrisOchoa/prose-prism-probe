
import React from "react";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface WritingInstructionsProps {
  prompt: string;
  isLoading: boolean;
}

const WritingInstructions: React.FC<WritingInstructionsProps> = ({ prompt, isLoading }) => {
  const isMobile = useIsMobile();
  
  return (
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
  );
};

export default WritingInstructions;
