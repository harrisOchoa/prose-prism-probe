
import { useState, useEffect, useCallback } from "react";
import { generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/geminiService";
import { updateAssessmentAnalysis, getAssessmentById } from "@/firebase/services/assessment";
import { toast } from "@/hooks/use-toast";
import { useAptitudeRecovery } from "@/hooks/assessment/useAptitudeRecovery";
import { useAptitudeCategories } from "@/hooks/assessment/useAptitudeCategories";
import { AssessmentData } from "@/types/assessment";
import { AnalysisStatus } from "@/firebase/services/assessment/types";

export const useAssessmentView = (id: string | undefined) => {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { recoverAptitudeScore } = useAptitudeRecovery(assessment);
  const { generateAptitudeCategories } = useAptitudeCategories(assessment);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Function to fetch the assessment
  const fetchAssessment = useCallback(async (assessmentId: string) => {
    setLoading(true);
    try {
      console.log(`Fetching assessment ${assessmentId}`);
      const data = await getAssessmentById(assessmentId);
      
      if (!data) {
        throw new Error(`Assessment ${assessmentId} not found`);
      }
      
      console.log(`Assessment ${assessmentId} loaded successfully`);
      setAssessment(data);
      return data;
    } catch (error: any) {
      console.error(`Error fetching assessment ${assessmentId}:`, error);
      setError(error instanceof Error ? error : new Error(error?.message || 'Unknown error'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch assessment on mount
  useEffect(() => {
    if (id) {
      fetchAssessment(id);
    }
  }, [id, fetchAssessment]);

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
        
        console.log("Missing insights detected, attempting to generate");
        setGeneratingSummary(true);
        
        try {
          const [summary, analysis] = await Promise.all([
            generateCandidateSummary(updatedData),
            generateStrengthsAndWeaknesses(updatedData)
          ]);

          const updateData = {
            aiSummary: summary,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            analysisStatus: 'basic_insights_generated' as AnalysisStatus
          };
          
          // Create a new object reference to ensure React detects the change
          updatedData = {
            ...updatedData,
            ...updateData
          };
          
          // Update state immediately with a new object reference to trigger rerender
          console.log("Local state updated with auto-generated insights");
          setAssessment(JSON.parse(JSON.stringify(updatedData)));

          // Update database in background
          await updateAssessmentAnalysis(updatedData.id, updateData);
          console.log("Auto-generated insights saved to assessment:", updatedData);
        } catch (aiError) {
          console.error("Error auto-generating insights:", aiError);
        } finally {
          setGeneratingSummary(false);
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
          description: `Some writing prompts could not be evaluated. Try using the 'Evaluate Writing' button to retry.`,
          variant: "default",
        });
        
        // Update status to failed
        try {
          await updateAssessmentAnalysis(updatedData.id, {
            analysisStatus: 'failed' as AnalysisStatus,
            analysisError: 'Some writing prompts could not be evaluated'
          });
          
          updatedData = {
            ...updatedData,
            analysisStatus: 'failed' as AnalysisStatus,
            analysisError: 'Some writing prompts could not be evaluated'
          };
        } catch (updateError) {
          console.error("Failed to update analysis status:", updateError);
        }
      }

      // Always update state with processed data
      if (JSON.stringify(updatedData) !== JSON.stringify(assessment)) {
        console.log("Assessment data has changed, updating state with a new object reference");
        setAssessment(JSON.parse(JSON.stringify(updatedData)));
      }
    };

    if (assessment) {
      processData();
    }
  }, [assessment?.id, assessment, setAssessment, recoverAptitudeScore, generateAptitudeCategories]);

  // Function to manually refresh assessment data
  const refreshAssessment = useCallback(async (refreshId: string) => {
    console.log("Manually refreshing assessment data");
    const refreshedData = await fetchAssessment(refreshId);
    if (refreshedData) {
      console.log("Assessment data refreshed successfully");
      // Create a deep copy to ensure React detects the change
      setAssessment(JSON.parse(JSON.stringify(refreshedData)));
      return refreshedData;
    }
    return null;
  }, [fetchAssessment]);

  return {
    assessment,
    loading,
    error,
    generatingSummary,
    setAssessment,
    setGeneratingSummary,
    refreshAssessment
  };
};
