
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/geminiService";
import { updateAssessmentAnalysis } from "@/firebase/assessmentService";
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
      toast({
        title: "Generating Insights",
        description: "System is analyzing the assessment to provide insights.",
      });
      
      // Generate insights
      const [summary, analysis] = await Promise.all([
        generateCandidateSummary(data),
        generateStrengthsAndWeaknesses(data)
      ]);
      
      // Update local state first
      const updatedData = {
        ...data,
        aiSummary: summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses
      };
      
      setAssessmentData(updatedData);
      
      // Update Firebase with the new insights
      await updateAssessmentAnalysis(data.id, {
        aiSummary: summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses
      });
      
      console.log("Successfully saved generated insights to database");
      
      // Verify data persistence with a fresh fetch
      const updatedDoc = await getDoc(doc(db, "assessments", data.id));
      if (updatedDoc.exists()) {
        const refreshedData = {
          id: updatedDoc.id,
          ...updatedDoc.data()
        } as AssessmentData;
        
        console.log("Retrieved updated assessment data after generating insights:", refreshedData);
        setAssessmentData(refreshedData);
      }
      
      toast({
        title: "Insights Updated",
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
