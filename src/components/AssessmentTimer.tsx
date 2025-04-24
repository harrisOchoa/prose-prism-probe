
import React, { useState, useEffect } from "react";
import { formatTime } from "@/lib/utils";

interface AssessmentTimerProps {
  duration: number;
  onTimeEnd: () => void;
  persistKey?: string;
}

const AssessmentTimer = ({ duration, onTimeEnd, persistKey }: AssessmentTimerProps) => {
  const getInitialTimeRemaining = (): number => {
    if (persistKey) {
      try {
        const storedTime = localStorage.getItem(`timer_${persistKey}`);
        if (storedTime) {
          const timeData = JSON.parse(storedTime);
          
          // Check if the stored timer is still valid (less than 24 hours old)
          const now = Date.now();
          const timeElapsed = now - timeData.timestamp;
          const MAX_TIMER_AGE = 24 * 60 * 60 * 1000; // 24 hours
          
          if (timeElapsed > MAX_TIMER_AGE) {
            localStorage.removeItem(`timer_${persistKey}`);
            return duration;
          }
          
          // Calculate remaining time
          const remainingTime = Math.max(0, timeData.remainingSeconds);
          return remainingTime;
        }
      } catch (error) {
        console.error("Error loading timer state:", error);
      }
    }
    return duration;
  };
  
  const [timeRemaining, setTimeRemaining] = useState(getInitialTimeRemaining());
  const [isRunning, setIsRunning] = useState(true);
  
  useEffect(() => {
    if (!isRunning) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        const newTime = prevTime - 1;
        
        // Save to localStorage if persistKey is provided
        if (persistKey && newTime % 5 === 0) { // Save every 5 seconds to reduce writes
          try {
            localStorage.setItem(`timer_${persistKey}`, JSON.stringify({
              remainingSeconds: newTime,
              timestamp: Date.now()
            }));
          } catch (error) {
            console.error("Error saving timer state:", error);
          }
        }
        
        if (newTime <= 0) {
          clearInterval(timer);
          onTimeEnd();
          // Clear the timer from storage once completed
          if (persistKey) {
            localStorage.removeItem(`timer_${persistKey}`);
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRunning, onTimeEnd, persistKey]);
  
  // Calculate display values
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  // Determine color based on remaining time
  const getColor = () => {
    if (timeRemaining < 60) return "text-red-600"; // Less than 1 minute
    if (timeRemaining < 300) return "text-amber-500"; // Less than 5 minutes
    return "text-primary";
  };

  return (
    <div className={`font-mono text-lg ${getColor()}`}>
      {formatTime(minutes)}:{formatTime(seconds)}
    </div>
  );
};

export default AssessmentTimer;
