
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { useFetchAssessment } from "./assessment/useFetchAssessment";
import { useAptitudeRecovery } from "./assessment/useAptitudeRecovery";
import { useAptitudeCategories } from "./assessment/useAptitudeCategories";
import { useUnifiedAnalysis } from "./assessment/useUnifiedAnalysis";
import { AssessmentData } from "@/types/assessment";
import { AnalysisStatus } from "@/firebase/services/assessment/types";

export const useAssessmentView = (id: string | undefined) => {
  const { assessment, setAssessment, loading, error, refreshAssessment } = useFetchAssessment(id);
  const { recoverAptitudeScore } = useAptitudeRecovery(assessment);
  const { generateAptitudeCategories } = useAptitudeCategories(assessment);
  const { startAnalysis, generatingSummary, evaluating } = useUnifiedAnalysis();

  // Process assessment data when it's loaded
  useEffect(() => {
    const processData = async () => {
      if (!assessment || !assessment.id) return;
      
      console.log(`[${new Date().toISOString()}] Processing assessment data:`, assessment.id);
      
      let updatedData = recoverAptitudeScore(assessment);
      updatedData = generateAptitudeCategories(updatedData);

      // Check analysis status
      const analysisStatus = updatedData.analysisStatus;
      console.log(`Assessment analysis status: ${analysisStatus}`);
      
      // If writing scores exist but we're missing summary data and there's no ongoing analysis, generate it
      if (updatedData.writingScores && 
          updatedData.writingScores.length > 0 && 
          updatedData.writingScores.some(score => score.score > 0) &&
          (!updatedData.aiSummary || !updatedData.strengths || !updatedData.weaknesses) &&
          (!analysisStatus || analysisStatus === 'writing_evaluated' || analysisStatus === 'failed')) {
        
        console.log("Missing insights detected, starting unified analysis");
        
        try {
          const success = await startAnalysis(updatedData.id, updatedData, 'normal');
          if (success) {
            // Refresh the assessment data after analysis
            const refreshedData = await refreshAssessment(updatedData.id);
            if (refreshedData) {
              setAssessment(JSON.parse(JSON.stringify(refreshedData)));
            }
          }
        } catch (error) {
          console.error("Error auto-starting unified analysis:", error);
        }
      } else if (
        updatedData.writingScores && 
        updatedData.writingScores.length > 0 && 
        updatedData.writingScores.some(score => score.score === 0) &&
        !analysisStatus
      ) {
        console.log("Found error scores, notifying user");
        toast({
          title: "Writing Evaluation Issues",
          description: `Some writing prompts could not be evaluated. The system will automatically retry.`,
          variant: "default",
        });
      }

      // Always update state with processed data if it has changed
      if (JSON.stringify(updatedData) !== JSON.stringify(assessment)) {
        console.log("Assessment data has changed, updating state");
        setAssessment(JSON.parse(JSON.stringify(updatedData)));
      }
    };

    if (assessment) {
      processData();
    }
  }, [assessment?.id, assessment, setAssessment, recoverAptitudeScore, generateAptitudeCategories, startAnalysis, refreshAssessment]);

  // Function to manually refresh assessment data
  const refresh = useCallback(async () => {
    if (id) {
      console.log("Manually refreshing assessment data");
      const refreshedData = await refreshAssessment(id);
      if (refreshedData) {
        console.log("Assessment data refreshed successfully");
        setAssessment(JSON.parse(JSON.stringify(refreshedData)));
      }
      return refreshedData;
    }
    return null;
  }, [id, refreshAssessment, setAssessment]);

  return {
    assessment,
    loading,
    error,
    generatingSummary,
    evaluating,
    setAssessment,
    setGeneratingSummary: () => {}, // Handled by unified analysis now
    refreshAssessment: refresh
  };
};
