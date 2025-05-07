
import { toast } from "@/hooks/use-toast";
import { AssessmentData } from "@/types/assessment";
import { updateAssessmentAnalysis } from "@/firebase/services/assessment";

/**
 * Core utility function to generate any type of analysis
 */
export const generateAnalysis = async (
  generatorFunction: Function,
  data: AssessmentData,
  updateKey: string
) => {
  try {
    console.log(`Starting analysis generation for ${updateKey}...`);
    
    toast({
      title: "Generating Analysis",
      description: `Generating analysis. This may take up to 30 seconds.`,
    });
    
    let result;
    let attempt = 0;
    const maxAttempts = 2;
    
    while (attempt < maxAttempts) {
      try {
        attempt++;
        console.log(`Analysis attempt ${attempt} for ${updateKey}...`);
        
        result = await generatorFunction(data);
        
        if (result) break;
      } catch (attemptError: any) {
        console.error(`Error in attempt ${attempt}:`, attemptError);
        
        if (attempt >= maxAttempts || !attemptError.message?.toLowerCase().includes('rate limit')) {
          throw attemptError;
        }
        
        const waitTime = attempt * 2000;
        console.log(`Rate limit detected. Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        toast({
          title: "Retrying Analysis",
          description: `API rate limit reached. Retrying in ${waitTime/1000} seconds...`,
        });
      }
    }
    
    if (!result) {
      throw new Error(`Failed to generate analysis after ${maxAttempts} attempts.`);
    }
    
    console.log(`Generated ${updateKey} analysis:`, result);
    
    // Create a deep copy of the assessment data before updating
    const updatedData = JSON.parse(JSON.stringify(data));
    updatedData[updateKey] = result;
    
    // We'll return the updated data for immediate UI updates
    console.log(`Updating UI with new ${updateKey} analysis`);
    
    // Update Firebase in background
    try {
      console.log(`Starting Firebase update for ${updateKey}`);
      await updateAssessmentAnalysis(data.id, {
        [updateKey]: result
      });
      
      console.log(`Successfully updated ${updateKey} in Firebase`);
      
      toast({
        title: "Analysis Complete",
        description: `${updateKey} analysis has been generated successfully.`,
      });
    } catch (updateError: any) {
      console.error(`Error updating ${updateKey} in Firebase:`, updateError);
      
      toast({
        title: "Update Failed",
        description: "Analysis was generated but could not be saved to the database.",
        variant: "destructive",
      });
    }
    
    return {
      result,
      updatedData
    };
  } catch (error: any) {
    console.error(`Error generating ${updateKey}:`, error);
    
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
  }
};
