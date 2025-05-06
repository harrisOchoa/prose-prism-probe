
import { useState, useEffect } from "react";
import { generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/geminiService";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import { toast } from "@/hooks/use-toast";
import { useFetchAssessment } from "./assessment/useFetchAssessment";
import { useAptitudeRecovery } from "./assessment/useAptitudeRecovery";
import { useAptitudeCategories } from "./assessment/useAptitudeCategories";
import { AssessmentData } from "@/types/assessment";

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

      // If writing scores exist but we're missing summary data, generate it
      if (updatedData.writingScores && 
          updatedData.writingScores.length > 0 && 
          updatedData.writingScores.some(score => score.score > 0) &&
          (!updatedData.aiSummary || !updatedData.strengths || !updatedData.weaknesses)) {
        
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
            weaknesses: analysis.weaknesses
          };
          
          // Create a new object to ensure React detects the change
          updatedData = {
            ...updatedData,
            ...updateData
          };
          
          // Update state immediately to show the UI with generated insights
          setAssessment(updatedData);
          console.log("Local state updated with auto-generated insights");

          await updateAssessmentAnalysis(updatedData.id, updateData);
          console.log("Auto-generated insights saved to assessment:", updatedData);
          
          // Refresh assessment data after update to ensure we have the latest
          if (id) {
            const refreshedData = await refreshAssessment(id);
            if (refreshedData) {
              console.log("Assessment refreshed after auto-generation");
              return; // Skip the setAssessment below as refreshAssessment will handle it
            }
          }
        } catch (aiError) {
          console.error("Error auto-generating insights:", aiError);
        } finally {
          setGeneratingSummary(false);
        }
      } else if (
        updatedData.writingScores && 
        updatedData.writingScores.length > 0 && 
        updatedData.writingScores.some(score => score.score === 0)
      ) {
        console.log("Found error scores, notifying user");
        toast({
          title: "Writing Evaluation Issues",
          description: `Some writing prompts could not be evaluated. Try using the 'Evaluate Writing' button to retry.`,
          variant: "default",
        });
      }

      if (JSON.stringify(updatedData) !== JSON.stringify(assessment)) {
        console.log("Assessment data has changed, updating state");
        setAssessment(updatedData);
      }
    };

    if (assessment) {
      processData();
    }
  }, [assessment?.id, assessment, setAssessment, recoverAptitudeScore, generateAptitudeCategories, refreshAssessment, id]);

  // Function to manually refresh assessment data
  const refresh = async () => {
    if (id) {
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
