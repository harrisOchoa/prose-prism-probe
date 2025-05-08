
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface WritingControlsProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  isDisabled: boolean;
  hasMinimumWords: boolean;
}

const WritingControls: React.FC<WritingControlsProps> = ({
  onSubmit,
  isSubmitting,
  isDisabled,
  hasMinimumWords
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col sm:flex-row justify-end items-center gap-3">
      <Button 
        onClick={onSubmit} 
        size={isMobile ? "default" : "lg"}
        className="w-full sm:w-auto"
        disabled={isDisabled || isSubmitting || !hasMinimumWords}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Recording your response...
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
  );
};

export default WritingControls;
