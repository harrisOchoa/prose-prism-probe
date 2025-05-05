
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
      
      // Show initial toast
      toast({
        title: "Generating Insights",
        description: "This may take a moment. The system will automatically retry if API rate limits are reached.",
      });
      
      // Generate insights with potential retries for rate limiting
      let summary, analysis;
      try {
        // Generate summary and analysis in parallel
        console.log("Starting parallel generation of summary and analysis...");
        [summary, analysis] = await Promise.all([
          generateCandidateSummary(data),
          generateStrengthsAndWeaknesses(data)
        ]);
        console.log("Summary and analysis generation completed successfully");
      } catch (apiError: any) {
        console.error("API error during generation:", apiError);
        // If the error includes rate limiting mention
        if (apiError.message && apiError.message.toLowerCase().includes("rate") && apiError.message.toLowerCase().includes("limit")) {
          toast({
            title: "API Rate Limit Hit",
            description: "The AI service is currently rate limited. Retrying with backoff...",
            variant: "destructive", // Only "default" and "destructive" are valid
          });
          // For clarity, we'll try again but one at a time
          console.log("Attempting sequential generation after rate limit...");
          summary = await generateCandidateSummary(data);
          console.log("Summary generated successfully");
          analysis = await generateStrengthsAndWeaknesses(data);
          console.log("Analysis generated successfully");
        } else {
          throw apiError; // Re-throw if it's not a rate limit issue
        }
      }
      
      console.log("Generated summary and analysis:", { 
        summaryLength: summary?.length,
        strengthsCount: analysis?.strengths?.length,
        weaknessesCount: analysis?.weaknesses?.length
      });
      
      if (!summary || !analysis || !analysis.strengths || !analysis.weaknesses) {
        throw new Error("Failed to generate complete insights");
      }
      
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
      
      // Update Firebase with the new insights
      console.log("Saving insights to Firebase...");
      try {
        await updateAssessmentAnalysis(data.id, updatePayload);
        console.log("Update to Firebase completed successfully");
      } catch (updateError) {
        console.error("Failed to update assessment in Firebase:", updateError);
        toast({
          title: "Update Failed",
          description: "Failed to save insights to the database. Please try again.",
          variant: "destructive",
        });
        throw updateError;
      }
      
      // Verify data was properly saved by fetching it again
      try {
        console.log("Verifying saved data...");
        const assessmentRef = doc(db, "assessments", data.id);
        const refreshedDoc = await getDoc(assessmentRef);
        
        if (refreshedDoc.exists()) {
          const savedData = refreshedDoc.data();
          if (!savedData.aiSummary) {
            console.warn("Saved summary is missing!");
            throw new Error("Failed to verify data was saved correctly");
          } else {
            console.log("Summary verified as successfully saved");
          }
        } else {
          console.warn("Could not verify - document doesn't exist");
        }
      } catch (verifyError) {
        console.error("Error verifying saved data:", verifyError);
      }
      
      // Update local state
      console.log("Updating local state with new insights");
      setAssessmentData(updatedData);
      
      toast({
        title: "Insights Generated",
        description: "Assessment insights have been generated successfully.",
      });

      return updatedData;
    } catch (error: any) {
      console.error("Error generating insights:", error);
      toast({
        title: "Failed to Generate Insights",
        description: error.message && error.message.includes("rate limit") 
          ? "API rate limit reached. Please wait a few minutes and try again." 
          : `Error: ${error.message || "Unknown error"}`,
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
