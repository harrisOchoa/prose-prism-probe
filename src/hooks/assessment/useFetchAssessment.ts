
import { useState, useEffect, useCallback } from "react";
import { getAssessmentById } from "@/firebase/services/assessment";
import { AssessmentData } from "@/types/assessment";
import { getCacheItem, setCacheItem } from "@/services/cache/cacheService";
import { trackApiCall } from "@/services/analytics/apiUsageTracker";

/**
 * Hook for fetching assessment data with caching
 */
export const useFetchAssessment = (id: string | undefined) => {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const cacheNamespace = 'assessments';
  
  const fetchAssessment = useCallback(async (assessmentId: string) => {
    if (!assessmentId) {
      setError("No assessment ID provided");
      setLoading(false);
      return null;
    }
    
    try {
      // Try to get from cache first
      const cachedAssessment = getCacheItem<AssessmentData>(
        assessmentId, 
        { namespace: cacheNamespace }
      );
      
      if (cachedAssessment) {
        console.log("Retrieved assessment from cache:", assessmentId);
        return cachedAssessment;
      }
      
      // Not in cache, fetch from API with retry logic
      console.log("Fetching assessment from API:", assessmentId);
      const startTime = Date.now();
      
      // Implement a simple retry mechanism
      let attempts = 0;
      const maxAttempts = 3;
      let assessment = null;
      
      while (attempts < maxAttempts && !assessment) {
        try {
          attempts++;
          assessment = await getAssessmentById(assessmentId);
          break;
        } catch (retryErr: any) {
          console.warn(`Attempt ${attempts}/${maxAttempts} failed:`, retryErr.message);
          if (attempts >= maxAttempts) throw retryErr;
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
        }
      }
      
      if (!assessment) {
        trackApiCall(`assessment/${assessmentId}`, false, false, startTime);
        throw new Error(`Assessment with ID ${assessmentId} not found`);
      }
      
      // Cache successful result
      setCacheItem(
        assessmentId, 
        assessment, 
        { 
          namespace: cacheNamespace, 
          expiry: 5 * 60 * 1000 // Cache for 5 minutes
        }
      );
      
      trackApiCall(`assessment/${assessmentId}`, true, false, startTime);
      return assessment;
    } catch (err: any) {
      const isRateLimit = err.message?.toLowerCase().includes('rate limit');
      console.error("Error fetching assessment:", err);
      trackApiCall(
        `assessment/${assessmentId}`, 
        false, 
        isRateLimit, 
        Date.now()
      );
      throw err;
    }
  }, []);
  
  const refreshAssessment = useCallback(async (assessmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchAssessment(assessmentId);
      setAssessment(result);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to load assessment");
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAssessment]);
  
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    refreshAssessment(id);
  }, [id, refreshAssessment]);
  
  return { assessment, setAssessment, loading, error, refreshAssessment };
};
