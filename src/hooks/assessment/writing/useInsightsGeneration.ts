
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/geminiService";
import { updateAssessmentAnalysis } from "@/firebase/assessmentService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { AssessmentData } from "@/types/assessment";
import { AnalysisStatus } from "@/firebase/services/assessment/types";

/**
 * Hook for handling writing insights generation functionality
 */
export const useInsightsGeneration = (
  assessmentData: AssessmentData, 
  setAssessmentData: (data: AssessmentData) => void
) => {
  const [generatingSummary, setGeneratingSummary] = useState(false);
  // Track rate limit information
  const [rateLimitInfo, setRateLimitInfo] = useState({
    isRateLimited: false,
    retryCount: 0,
    maxRetries: 3,
    backoffTime: 0
  });

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
      setRateLimitInfo({
        isRateLimited: false,
        retryCount: 0,
        maxRetries: 3,
        backoffTime: 0
      });
      
      console.log("Starting insights generation for assessment:", data.id);
      
      // Update status to pending
      await updateAssessmentAnalysis(data.id, {
        analysisStatus: 'pending' as AnalysisStatus
      });
      
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
          // Update rate limit state
          setRateLimitInfo(prev => ({
            isRateLimited: true,
            retryCount: prev.retryCount + 1,
            maxRetries: 3,
            backoffTime: (prev.retryCount + 1) * 5 // Increases backoff time with each retry
          }));
          
          // Show persistent rate limit toast with more detail
          toast({
            title: "API Rate Limit Detected",
            description: "The AI service is currently rate limited. The system will try again automatically.",
            variant: "destructive",
            duration: 10000, // 10 seconds
          });
          
          // For clarity, we'll try again but one at a time with delay
          console.log("Attempting sequential generation after rate limit...");
          
          // Add backoff delay before retrying
          const backoffDelay = (rateLimitInfo.retryCount + 1) * 5000; // 5s, 10s, 15s
          console.log(`Waiting for ${backoffDelay/1000}s before retry attempt ${rateLimitInfo.retryCount + 1}...`);
          
          try {
            // Update the assessment with rate limit error info for the UI to detect
            await updateAssessmentAnalysis(data.id, {
              analysisStatus: 'rate_limited' as AnalysisStatus,
              analysisError: 'API rate limit reached. Automatic retry in progress.'
            });
            
            // Update local state to reflect rate limiting
            setAssessmentData({
              ...data,
              analysisStatus: 'rate_limited' as AnalysisStatus,
              analysisError: 'API rate limit reached. Automatic retry in progress.'
            });
          } catch (updateError) {
            console.error("Error updating rate limit status:", updateError);
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          
          // Try one at a time
          summary = await generateCandidateSummary(data);
          console.log("Summary generated successfully after rate limit");
          analysis = await generateStrengthsAndWeaknesses(data);
          console.log("Analysis generated successfully after rate limit");
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
      
      // Reset rate limit state since we succeeded
      setRateLimitInfo({
        isRateLimited: false,
        retryCount: 0,
        maxRetries: 3,
        backoffTime: 0
      });
      
      // Prepare update payload
      const updatePayload = {
        aiSummary: summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        analysisStatus: 'basic_insights_generated' as AnalysisStatus
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
      
      // Check if this is a rate limit error
      const isRateLimit = error.message && error.message.toLowerCase().includes("rate limit");
      
      // Update status based on error type
      try {
        await updateAssessmentAnalysis(assessmentData.id, {
          analysisStatus: isRateLimit ? 'rate_limited' : 'failed' as AnalysisStatus,
          analysisError: error.message || "Unknown error"
        });
      } catch (updateError) {
        console.error("Failed to update analysis status:", updateError);
      }
      
      // Show different toast messages based on error type
      if (isRateLimit) {
        toast({
          title: "API Rate Limit Reached",
          description: "The AI service is temporarily unavailable due to rate limiting. Please try again in a few minutes.",
          variant: "destructive",
          duration: 10000, // 10 seconds
        });
      } else {
        toast({
          title: "Failed to Generate Insights",
          description: `Error: ${error.message || "Unknown error"}`,
          variant: "destructive",
        });
      }
      
      return null;
    } finally {
      setGeneratingSummary(false);
    }
  };

  return {
    generatingSummary,
    setGeneratingSummary,
    generateInsights,
    rateLimitInfo
  };
};
