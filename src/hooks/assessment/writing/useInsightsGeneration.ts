
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/geminiService";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { AssessmentData } from "@/types/assessment";

/**
 * Hook for handling writing insights generation functionality
 */
export const useInsightsGeneration = (
  assessmentData: AssessmentData, 
  setAssessmentData: (data: AssessmentData) => void
) => {
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const generateInsights = async (data: AssessmentData = assessmentData) => {
    if (!data.writingScores || data.writingScores.length === 0) {
      toast({
        title: "No Writing Scores",
        description: "Please evaluate the writing first to generate insights.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setGeneratingSummary(true);
      console.log("Starting insights generation for assessment:", data.id);
      
      // Generate insights
      const [summary, analysis] = await Promise.all([
        generateCandidateSummary(data),
        generateStrengthsAndWeaknesses(data)
      ]);
      
      console.log("Generated summary and analysis:", { 
        summaryLength: summary?.length,
        strengthsCount: analysis?.strengths?.length,
        weaknessesCount: analysis?.weaknesses?.length
      });
      
      // Prepare update payload
      const updatePayload = {
        aiSummary: summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses
      };
      
      // Update local state first
      const updatedData = {
        ...data,
        ...updatePayload
      };
      
      // Update Firebase with the new insights - ensure this completes
      const updateSuccess = await updateAssessmentAnalysis(data.id, updatePayload);
      console.log("Update to Firebase completed:", updateSuccess);
      
      if (!updateSuccess) {
        console.error("Failed to update assessment in Firebase");
        toast({
          title: "Update Failed",
          description: "Failed to save insights to the database. Please try again.",
          variant: "destructive",
        });
      }
      
      // Update local state
      setAssessmentData(updatedData);
      
      toast({
        title: "Insights Generated",
        description: "Assessment insights have been generated successfully.",
      });

      return updatedData;
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Failed to Generate Insights",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setGeneratingSummary(false);
    }
  };

  return {
    generatingSummary,
    setGeneratingSummary,
    generateInsights
  };
};
