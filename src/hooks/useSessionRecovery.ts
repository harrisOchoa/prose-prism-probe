
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
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TIMER_KEY);
        return null;
      }
      
      // Don't offer to resume if the session was already completed
      if (sessionData.completed) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TIMER_KEY);
        return null;
      }
      
      return sessionData;
    } catch (error) {
      console.error("Failed to load session data:", error);
      return null;
    }
  };
  
  const [sessionData, setSessionData] = useState<SessionData | null>(loadSessionData);
  const [isResumed, setIsResumed] = useState(false);
  
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
  
  // Clear the session data when assessment is completed or declined
  const clearSessionData = () => {
    try {
      // Remove both session data and related timer data
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TIMER_KEY);
      localStorage.removeItem(`aptitude_timer`);
      localStorage.removeItem(`writing_timer`);
      
      // Clear both types of session data to avoid any lingering issues
      localStorage.removeItem(`assessment_session_aptitude_data`);
      localStorage.removeItem(`assessment_session_writing_data`);
      
      setSessionData(null);
      console.log("Session data cleared successfully");
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
  
  // Decline resuming session
  const declineResume = () => {
    clearSessionData();
    setIsResumed(false);
  };
  
  return {
    hasExistingSession: !!sessionData && !isResumed,
    saveSessionData,
    clearSessionData,
    resumeSession,
    declineResume,
    sessionData
  };
};
