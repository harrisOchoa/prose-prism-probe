import { useState, useEffect } from "react";
import { generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/geminiService";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import { toast } from "@/hooks/use-toast";
import { useFetchAssessment } from "./assessment/useFetchAssessment";
import { useAptitudeRecovery } from "./assessment/useAptitudeRecovery";
import { useAptitudeCategories } from "./assessment/useAptitudeCategories";
import { AssessmentData } from "@/types/assessment";
import { AnalysisStatus } from "@/firebase/services/assessment/types";

export const useAssessmentView = (id: string | undefined) => {
  const { assessment, setAssessment, loading, error, refreshAssessment } = useFetchAssessment(id);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const { recoverAptitudeScore } = useAptitudeRecovery(assessment);
  const { generateAptitudeCategories } = useAptitudeCategories(assessment);

  // Process assessment data when it's loaded
  useEffect(() => {
    const processData = async () => {
      if (!assessment || !assessment.id) return;
      
      console.log(`[${new Date().toISOString()}] Processing assessment data in useEffect:`, assessment.id);
      
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
          setAssessment({...updatedData});

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
        setAssessment({...updatedData});
      }
    };

    if (assessment) {
      processData();
    }
  }, [assessment?.id, assessment, setAssessment, recoverAptitudeScore, generateAptitudeCategories, refreshAssessment, id]);

  // Function to manually refresh assessment data
  const refresh = async () => {
    if (id) {
      console.log("Manually refreshing assessment data");
      return await refreshAssessment(id);
    }
    return null;
  };

  return {
    assessment,
    loading,
    error,
    generatingSummary,
    setAssessment,
    setGeneratingSummary,
    refreshAssessment: refresh
  };
};
