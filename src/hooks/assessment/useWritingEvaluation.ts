
import { useState } from "react";
import { AssessmentData } from "@/types/assessment";
import { useWritingScores, useInsightsGeneration } from "./writing";
import { toast } from "@/hooks/use-toast";

/**
 * Hook for handling writing evaluation functionality
 */
export const useWritingEvaluation = (
  assessmentData: AssessmentData, 
  setAssessmentData: (data: AssessmentData) => void
) => {
  const { 
    evaluating, 
    evaluateWritingResponses 
  } = useWritingScores(assessmentData, setAssessmentData);
  
  const { 
    generatingSummary, 
    setGeneratingSummary, 
    generateInsights 
  } = useInsightsGeneration(assessmentData, setAssessmentData);

  const handleManualEvaluation = async () => {
    if (!assessmentData || !assessmentData.completedPrompts || assessmentData.completedPrompts.length === 0) {
      toast({
        title: "No Writing Prompts",
        description: "There are no completed writing prompts to evaluate.",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting manual evaluation process...");
    toast({
      title: "Evaluation Process Started",
      description: "This will evaluate writing and generate insights. It may take a minute or two.",
    });

    try {
      // Step 1: Evaluate writing responses
      console.log("Step 1: Evaluating writing responses");
      setGeneratingSummary(true); // Show loading state from the beginning
      const updatedData = await evaluateWritingResponses();
      
      if (!updatedData) {
        console.error("Writing evaluation failed, cannot proceed to insights");
        setGeneratingSummary(false);
        return;
      }
      
      // Force immediate UI update after writing scores are available
      console.log("Updating UI with writing scores");
      setAssessmentData({...updatedData});
      
      // Step 2: Generate insights based on scores
      console.log("Step 2: Generating insights based on scores");
      const finalData = await generateInsights(updatedData);
      
      if (finalData) {
        // Force immediate UI update with the generated insights using a new object reference
        console.log("Updating UI with generated insights");
        setAssessmentData({...finalData});
      }
      
      toast({
        title: "Evaluation Complete",
        description: "Assessment has been successfully evaluated and insights generated.",
      });
    } catch (error: any) {
      console.error("Error in handleManualEvaluation:", error);
      toast({
        title: "Evaluation Error",
        description: `An error occurred: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setGeneratingSummary(false);
    }
  };
  
  const regenerateInsights = async () => {
    console.log("Starting insights regeneration...");
    try {
      setGeneratingSummary(true);
      
      // Show initial toast
      toast({
        title: "Regenerating Insights",
        description: "Please wait while we generate new insights for this assessment.",
      });
      
      const updatedData = await generateInsights();
      
      // If we got updated data, force a UI update with a new object reference
      if (updatedData) {
        console.log("Updating UI with regenerated insights");
        setAssessmentData({...updatedData});
        
        toast({
          title: "Insights Regenerated",
          description: "Assessment insights have been successfully regenerated.",
        });
      }
    } catch (error: any) {
      console.error("Error regenerating insights:", error);
      toast({
        title: "Regeneration Error",
        description: `An error occurred: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setGeneratingSummary(false);
    }
  };

  return {
    evaluating,
    generatingSummary,
    handleManualEvaluation,
    regenerateInsights,
    setGeneratingSummary
  };
};
