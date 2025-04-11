
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface AssessmentTimerProps {
  duration: number; // in seconds
  onTimeEnd: () => void;
}

const AssessmentTimer = ({ duration, onTimeEnd }: AssessmentTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);
  
  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeEnd();
      return;
    }
    
    // Set warning state when 5 minutes remaining
    if (timeRemaining <= 300 && !isWarning) {
      setIsWarning(true);
    }
    
    const timer = setTimeout(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeRemaining, onTimeEnd, isWarning]);
  
  // Format the time as mm:ss
  const formatTime = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={`assessment-timer ${isWarning ? 'text-assessment-warning animate-pulse' : ''}`}>
      <Clock className="w-5 h-5" />
      <span>{formatTime()}</span>
    </div>
  );
};

export default AssessmentTimer;
