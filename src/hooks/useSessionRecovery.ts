
import { useState, useEffect } from 'react';

interface SessionData {
  type: 'aptitude' | 'writing';
  currentIndex: number;
  answers: number[];
  timestamp: number;
  completed: boolean;
  textResponse?: string; // For writing assessment
}

export const useSessionRecovery = (
  sessionType: 'aptitude' | 'writing',
  totalItems: number
) => {
  const STORAGE_KEY = `assessment_session_${sessionType}_data`;
  const TIMER_KEY = `${sessionType}_timer`;
  
  // Check for existing session data
  const loadSessionData = (): SessionData | null => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) return null;
      
      const sessionData = JSON.parse(storedData) as SessionData;
      
      // Validate session data
      if (sessionData.type !== sessionType) return null;
      
      // Check if session is still valid (less than 24 hours old)
      const now = Date.now();
      const sessionAge = now - sessionData.timestamp;
      const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > MAX_SESSION_AGE) {
        clearAllSessionData();
        return null;
      }
      
      // Don't offer to resume if the session was already completed
      if (sessionData.completed) {
        clearAllSessionData();
        return null;
      }
      
      return sessionData;
    } catch (error) {
      console.error("Failed to load session data:", error);
      // If there's an error parsing, clear everything to avoid persistent issues
      clearAllSessionData();
      return null;
    }
  };
  
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isResumed, setIsResumed] = useState(false);
  
  // Load session data only once on mount
  useEffect(() => {
    const data = loadSessionData();
    setSessionData(data);
  }, []);
  
  // Save session data periodically
  const saveSessionData = (
    currentIndex: number, 
    answers: number[], 
    completed: boolean = false,
    textResponse?: string
  ) => {
    try {
      const data: SessionData = {
        type: sessionType,
        currentIndex,
        answers,
        timestamp: Date.now(),
        completed,
        textResponse
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSessionData(data);
    } catch (error) {
      console.error("Failed to save session data:", error);
    }
  };
  
  // Clear all session-related data from localStorage
  const clearAllSessionData = () => {
    try {
      // Clear all possible session data keys systematically
      const keysToRemove = [
        // Current session keys
        STORAGE_KEY,
        TIMER_KEY,
        // All possible session keys to ensure complete cleanup
        'assessment_session_aptitude_data',
        'assessment_session_writing_data',
        'aptitude_timer',
        'writing_timer'
      ];
      
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
      
      setSessionData(null);
      setIsResumed(false);
      console.log("All session data cleared successfully");
    } catch (error) {
      console.error("Failed to clear session data:", error);
    }
  };
  
  // Handle resuming session
  const resumeSession = () => {
    if (sessionData) {
      setIsResumed(true);
      return {
        currentQuestionIndex: sessionData.currentIndex,
        selectedOptions: sessionData.answers,
        textResponse: sessionData.textResponse
      };
    }
    return null;
  };
  
  // Decline resuming session with a forced clean state
  const declineResume = () => {
    clearAllSessionData();
    setIsResumed(false);
    // Force reload to ensure clean state
    setTimeout(() => window.location.reload(), 100);
  };
  
  return {
    hasExistingSession: !!sessionData && !isResumed,
    saveSessionData,
    clearSessionData: clearAllSessionData,
    resumeSession,
    declineResume,
    sessionData
  };
};
