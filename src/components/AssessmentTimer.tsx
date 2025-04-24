
import { useEffect, useState, useRef } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssessmentTimerProps {
  duration: number; // in seconds
  onTimeEnd: () => void;
}

const AssessmentTimer = ({ duration, onTimeEnd }: AssessmentTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Only set the end time when the component mounts or if it hasn't been set yet
    if (endTimeRef.current === null) {
      endTimeRef.current = Date.now() + duration * 1000;
    }
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTimeRef.current! - now) / 1000));
      
      setTimeRemaining(remaining);
      
      // Set warning state when 5 minutes remaining
      if (remaining <= 300 && !isWarning) {
        setIsWarning(true);
      }
      
      // Handle timer end
      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        onTimeEnd();
        return;
      }
    };
    
    // Update immediately then set interval
    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [duration, onTimeEnd, isWarning]);
  
  // Format the time as mm:ss
  const formatTime = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={cn(
      "assessment-timer fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-elevation-1 transition-all",
      isWarning ? 'text-assessment-warning bg-amber-50 animate-pulse border border-amber-200' : 'border'
    )}>
      {isWarning ? 
        <AlertCircle className="w-5 h-5" /> : 
        <Clock className="w-5 h-5" />
      }
      <span className="font-mono font-semibold">{formatTime()}</span>
    </div>
  );
};

export default AssessmentTimer;
