
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { useFetchAssessment } from "../assessment/useFetchAssessment";
import { useAptitudeRecovery } from "../assessment/useAptitudeRecovery";
import { useAptitudeCategories } from "../assessment/useAptitudeCategories";
import { useUnifiedAnalysis } from "../assessment/useUnifiedAnalysis";
import { AssessmentData } from "@/types/assessment";
import { StrictAssessmentData, ApiResponse } from "@/types/optimized";
import { AnalysisStatus } from "@/firebase/services/assessment/types";
import { mergeAssessmentData } from "@/utils/immutableUpdates";
import { performanceMonitor } from "@/services/monitoring/PerformanceMonitor";
import { assessmentCache, createDebouncedFunction } from "@/utils/optimizedSelectors";

export const useOptimizedAssessmentView = (id: string | undefined) => {
  const { assessment, setAssessment, loading, error, refreshAssessment } = useFetchAssessment(id);
  const { recoverAptitudeScore } = useAptitudeRecovery(assessment);
  const { generateAptitudeCategories } = useAptitudeCategories(assessment);
  const { startAnalysis, generatingSummary, evaluating } = useUnifiedAnalysis();

  // Enhanced state with error handling
  const [apiResponse, setApiResponse] = useState<ApiResponse<StrictAssessmentData>>({
    data: undefined,
    error: undefined,
    loading: false,
    timestamp: new Date()
  });

  // Debounced refresh function to prevent excessive API calls
  const debouncedRefresh = useCallback(
    createDebouncedFunction(async (assessmentId: string) => {
      const timerName = `refresh_assessment_${assessmentId}`;
      performanceMonitor.startTimer(timerName, { assessmentId });
      
      try {
        // Check cache first
        const cachedData = assessmentCache.get(assessmentId);
        if (cachedData) {
          console.log("Using cached assessment data");
          setAssessment(cachedData);
          return cachedData;
        }

        console.log("Fetching fresh assessment data");
        const refreshedData = await refreshAssessment(assessmentId);
        if (refreshedData) {
          // Cache the fresh data
          assessmentCache.set(assessmentId, refreshedData);
          setAssessment(refreshedData);
          
          setApiResponse({
            data: refreshedData as StrictAssessmentData,
            error: undefined,
            loading: false,
            timestamp: new Date()
          });
        }
        
        return refreshedData;
      } catch (error) {
        console.error("Error in debounced refresh:", error);
        setApiResponse(prev => ({
          ...prev,
          error: {
            code: 'REFRESH_ERROR',
            message: error instanceof Error ? error.message : 'Failed to refresh assessment',
            details: { assessmentId },
            timestamp: new Date()
          },
          loading: false,
          timestamp: new Date()
        }));
        return null;
      } finally {
        performanceMonitor.endTimer(timerName);
      }
    }, 300),
    [refreshAssessment, setAssessment]
  );

  // Process assessment data when it's loaded with enhanced error handling
  useEffect(() => {
    const processData = async () => {
      if (!assessment || !assessment.id) return;
      
      const timerName = `process_assessment_${assessment.id}`;
      performanceMonitor.startTimer(timerName, { assessmentId: assessment.id });
      
      try {
        console.log(`[${new Date().toISOString()}] Processing assessment data:`, assessment.id);
        
        // Use immutable updates instead of deep copying
        let updatedData = mergeAssessmentData(assessment, recoverAptitudeScore(assessment));
        updatedData = mergeAssessmentData(updatedData, generateAptitudeCategories(updatedData));

        // Check analysis status with better error handling
        const analysisStatus = updatedData.analysisStatus;
        console.log(`Assessment analysis status: ${analysisStatus}`);
        
        // Enhanced logic for missing insights with retry mechanism
        if (updatedData.writingScores && 
            updatedData.writingScores.length > 0 && 
            updatedData.writingScores.some(score => score.score > 0) &&
            (!updatedData.aiSummary || !updatedData.strengths || !updatedData.weaknesses) &&
            (!analysisStatus || analysisStatus === 'writing_evaluated' || analysisStatus === 'failed')) {
          
          console.log("Missing insights detected, starting unified analysis");
          
          try {
            const success = await startAnalysis(updatedData.id, updatedData, 'normal');
            if (success) {
              // Use debounced refresh to get latest data
              await debouncedRefresh(updatedData.id);
            }
          } catch (analysisError) {
            console.error("Error auto-starting unified analysis:", analysisError);
            setApiResponse(prev => ({
              ...prev,
              error: {
                code: 'ANALYSIS_ERROR',
                message: 'Failed to start analysis',
                details: { originalError: analysisError },
                timestamp: new Date()
              }
            }));
          }
        } else if (
          updatedData.writingScores && 
          updatedData.writingScores.length > 0 && 
          updatedData.writingScores.some(score => score.score === 0) &&
          !analysisStatus
        ) {
          console.log("Found error scores, notifying user with retry option");
          toast({
            title: "Writing Evaluation Issues",
            description: `Some writing prompts could not be evaluated. The system will automatically retry.`,
            variant: "default",
          });
        }

        // Only update state if data has actually changed (avoid unnecessary renders)
        if (JSON.stringify(updatedData) !== JSON.stringify(assessment)) {
          console.log("Assessment data has changed, updating state");
          setAssessment(updatedData);
          
          // Cache the updated data
          assessmentCache.set(updatedData.id, updatedData);
          
          setApiResponse({
            data: updatedData as StrictAssessmentData,
            error: undefined,
            loading: false,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error("Error processing assessment data:", error);
        setApiResponse(prev => ({
          ...prev,
          error: {
            code: 'PROCESSING_ERROR',
            message: error instanceof Error ? error.message : 'Failed to process assessment data',
            timestamp: new Date()
          }
        }));
      } finally {
        performanceMonitor.endTimer(timerName);
      }
    };

    if (assessment) {
      processData();
    }
  }, [assessment?.id, assessment, setAssessment, recoverAptitudeScore, generateAptitudeCategories, startAnalysis, debouncedRefresh]);

  // Function to manually refresh assessment data with caching
  const refresh = useCallback(async () => {
    if (id) {
      return await debouncedRefresh(id);
    }
    return null;
  }, [id, debouncedRefresh]);

  // Clear cache on unmount or error
  useEffect(() => {
    return () => {
      if (id && apiResponse.error) {
        assessmentCache.clear();
      }
    };
  }, [id, apiResponse.error]);

  return {
    assessment,
    loading,
    error,
    generatingSummary,
    evaluating,
    setAssessment,
    refreshAssessment: refresh,
    // Enhanced API response with error details
    apiResponse,
    // Expose performance metrics and cache status for monitoring
    getPerformanceMetrics: () => performanceMonitor.getMetrics(),
    getCacheStats: () => ({
      size: assessmentCache.size(),
      hasCachedData: id ? assessmentCache.has(id) : false
    })
  };
};
