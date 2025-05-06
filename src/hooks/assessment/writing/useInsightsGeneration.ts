
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
      console.log("Starting insights generation for assessment:", data.id);
      
      // Show initial toast
      toast({
        title: "Generating Insights",
        description: "This may take a moment. The system will automatically retry if API rate limits are reached.",
      });
      
      // Check if we have any valid scores
      const validScores = data.writingScores.filter(score => score.score > 0);
      if (validScores.length === 0) {
        throw new Error("No valid writing scores to base insights on. Try evaluating writing first.");
      }
      
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
            variant: "destructive", 
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
      
      // Create a new object for the assessment data to ensure React detects the change
      const updatedData = {
        ...data,
        ...updatePayload
      };
      
      // Update UI immediately with generated insights
      console.log("Updating UI with generated insights:", updatePayload);
      setAssessmentData(updatedData);
      
      // Update Firebase with the new insights
      console.log("Saving insights to Firebase...");
      try {
        await updateAssessmentAnalysis(data.id, updatePayload);
        console.log("Update to Firebase completed successfully");
        
        toast({
          title: "Insights Generated",
          description: "Assessment insights have been generated successfully.",
        });
        
      } catch (updateError) {
        console.error("Failed to update assessment in Firebase:", updateError);
        toast({
          title: "Update Failed",
          description: "Failed to save insights to the database, but they are available in your current session.",
          variant: "destructive",
        });
      }

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
