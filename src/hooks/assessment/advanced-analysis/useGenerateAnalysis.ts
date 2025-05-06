import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { AssessmentData } from "@/types/assessment";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";

type AnalysisType = 'writing' | 'personality' | 'interview' | 'questions' | 'profile' | 'aptitude';

interface UseGenerateAnalysisProps {
  assessmentData: AssessmentData;
  setAssessmentData: (data: AssessmentData) => void;
  generatorFunction: (assessmentData: AssessmentData) => Promise<any>;
  analysisType: AnalysisType;
  updateKey: string;
}

/**
 * Hook for generating a specific type of analysis
 */
export const useGenerateAnalysis = ({
  assessmentData,
  setAssessmentData,
  generatorFunction,
  analysisType,
  updateKey
}: UseGenerateAnalysisProps) => {
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    try {
      console.log(`Starting ${analysisType} analysis generation...`);
      
      if (!assessmentData?.id) {
        console.error("Missing assessment ID");
        toast({
          title: "Error",
          description: "Assessment data is not properly loaded. Please refresh the page.",
          variant: "destructive",
        });
        return null;
      }

      // Set generating state
      setGenerating(true);
      
      toast({
        title: "Generating Analysis",
        description: `Generating ${analysisType} analysis. This may take up to 30 seconds.`,
      });
      
      let result;
      
      // Try up to 2 times with backoff in case of rate limiting
      let attempt = 0;
      const maxAttempts = 2;
      
      while (attempt < maxAttempts) {
        try {
          attempt++;
          console.log(`${analysisType} analysis attempt ${attempt}...`);
          
          result = await generatorFunction(assessmentData);
          
          // If we got a result, break out of retry loop
          if (result) break;
          
        } catch (attemptError: any) {
          console.error(`Error in attempt ${attempt}:`, attemptError);
          
          // If this is our last attempt, or it's not a rate limit error, throw the error
          if (attempt >= maxAttempts || !attemptError.message?.toLowerCase().includes('rate limit')) {
            throw attemptError;
          }
          
          // Otherwise, wait before trying again
          const waitTime = attempt * 2000; // 2 seconds, 4 seconds, etc.
          console.log(`Rate limit detected. Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Notify user of retry
          toast({
            title: "Retrying Analysis",
            description: `API rate limit reached. Retrying in ${waitTime/1000} seconds...`,
          });
        }
      }
      
      if (!result) {
        throw new Error(`Failed to generate ${analysisType} analysis after ${maxAttempts} attempts.`);
      }
      
      console.log(`Generated ${analysisType} analysis:`, result);
      
      // Create a new object reference to ensure React detects the change
      const updatedData = {
        ...assessmentData,
        [updateKey]: result
      };
      
      // Immediately update UI
      console.log(`Immediately updating UI with new ${analysisType} analysis`);
      setAssessmentData({...updatedData});
      
      // Update Firebase in background
      try {
        console.log(`Starting Firebase update for ${analysisType} analysis`);
        await updateAssessmentAnalysis(assessmentData.id, {
          [updateKey]: result
        });
        
        console.log(`Successfully updated ${analysisType} analysis in Firebase`);
        
        toast({
          title: "Analysis Complete",
          description: `${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} analysis has been generated successfully.`,
        });
        
        return result;
      } catch (updateError: any) {
        console.error(`Error updating ${analysisType} analysis in Firebase:`, updateError);
        
        toast({
          title: "Update Failed",
          description: "Analysis was generated but could not be saved to the database. The analysis will still be available until you refresh the page.",
          variant: "destructive",
        });
        
        // Still return the result even if saving to Firebase failed
        return result;
      }
    } catch (error: any) {
      console.error(`Error generating ${analysisType} analysis:`, error);
      
      // Determine specific error message based on error type
      let errorMessage = "Unknown error occurred";
      
      if (error.message) {
        if (error.message.includes("rate limit")) {
          errorMessage = "API rate limit reached. Please wait a few minutes and try again.";
        } else if (error.message.includes("API key")) {
          errorMessage = "Invalid or missing API key. Check your Gemini API configuration.";
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      // Reset generating state regardless of success/failure
      setGenerating(false);
    }
  };

  return {
    generating,
    generate
  };
};
