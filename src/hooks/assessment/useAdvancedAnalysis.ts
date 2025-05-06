import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  generateDetailedWritingAnalysis,
  generatePersonalityInsights,
  generateInterviewQuestions,
  compareWithIdealProfile, // Using the proper export name
  generateAptitudeAnalysis
} from "@/services/geminiService";
import { updateAssessmentAnalysis } from "@/firebase/assessmentService";
import { AssessmentData } from "@/types/assessment";

/**
 * Hook for handling advanced analysis generation functionality
 */
export const useAdvancedAnalysis = (
  assessmentData: AssessmentData,
  setAssessmentData: (data: AssessmentData) => void
) => {
  const [generatingAnalysis, setGeneratingAnalysis] = useState<{[key: string]: boolean}>({
    writing: false,
    personality: false,
    interview: false,
    profile: false,
    aptitude: false
  });

  const generateAdvancedAnalysis = async (type: string) => {
    try {
      console.log(`Starting ${type} analysis generation...`);
      
      if (!assessmentData?.id) {
        console.error("Missing assessment ID");
        toast({
          title: "Error",
          description: "Assessment data is not properly loaded. Please refresh the page.",
          variant: "destructive",
        });
        return null;
      }

      if (!assessmentData.overallWritingScore && type !== 'aptitude') {
        console.error("Writing not evaluated yet");
        toast({
          title: "Writing Not Evaluated",
          description: "Please evaluate the writing first to generate advanced analysis.",
          variant: "destructive",
        });
        return null;
      }
      
      // For aptitude analysis, we need aptitude scores
      if (type === 'aptitude' && !assessmentData.aptitudeScore) {
        console.error("Missing aptitude score");
        toast({
          title: "Aptitude Results Needed",
          description: "This candidate needs to complete the aptitude test before analysis.",
          variant: "destructive",
        });
        return null;
      }

      // Set generating state for this analysis type
      setGeneratingAnalysis(prev => ({ ...prev, [type]: true }));
      
      toast({
        title: "Generating Analysis",
        description: `Generating ${type} analysis. This may take a moment.`,
      });
      
      let result;
      let updateKey = '';
      
      // Try up to 2 times with backoff in case of rate limiting
      let attempt = 0;
      const maxAttempts = 2;
      
      while (attempt < maxAttempts) {
        try {
          attempt++;
          console.log(`${type} analysis attempt ${attempt}...`);
          
          switch(type) {
            case 'writing':
              result = await generateDetailedWritingAnalysis(assessmentData);
              updateKey = 'detailedWritingAnalysis';
              break;
            case 'personality':
              result = await generatePersonalityInsights(assessmentData);
              updateKey = 'personalityInsights';
              break;
            case 'interview':
            case 'questions':
              result = await generateInterviewQuestions(assessmentData);
              updateKey = 'interviewQuestions';
              break;
            case 'profile':
              // Use the correct function name that's imported
              result = await compareWithIdealProfile(assessmentData);
              updateKey = 'profileMatch';
              break;
            case 'aptitude':
              result = await generateAptitudeAnalysis(assessmentData);
              updateKey = 'aptitudeAnalysis';
              break;
            default:
              throw new Error(`Unknown analysis type: ${type}`);
          }
          
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
        throw new Error(`Failed to generate ${type} analysis after ${maxAttempts} attempts.`);
      }
      
      console.log(`Generated ${type} analysis:`, result);
      
      // Update local state immediately
      const updatedData = {
        ...assessmentData,
        [updateKey]: result
      };
      
      setAssessmentData(updatedData);
      
      // Update Firebase
      try {
        await updateAssessmentAnalysis(assessmentData.id, {
          [updateKey]: result
        });
        
        console.log(`Successfully updated ${type} analysis in Firebase`);
        
        toast({
          title: "Analysis Complete",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} analysis has been generated successfully.`,
        });
      } catch (updateError: any) {
        console.error(`Error updating ${type} analysis in Firebase:`, updateError);
        
        if (updateError.message && updateError.message.includes("permission-denied")) {
          toast({
            title: "Permission Error",
            description: "You don't have permission to update this assessment. Please check your Firestore security rules.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Update Failed",
            description: "Analysis was generated but could not be saved to the database. Please try again.",
            variant: "destructive",
          });
        }
        // Still return the result even if saving to Firebase failed
      }
      
      return result;
    } catch (error: any) {
      console.error(`Error generating ${type} analysis:`, error);
      
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
      // Reset generating state for this analysis type
      setGeneratingAnalysis(prev => ({ ...prev, [type]: false }));
    }
  };

  return {
    generatingAnalysis,
    generateAdvancedAnalysis
  };
};
