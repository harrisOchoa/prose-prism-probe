
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export const useFocusWarning = (windowBlurs: number) => {
  const [showFocusWarning, setShowFocusWarning] = useState(false);

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

  return { showFocusWarning };
};
