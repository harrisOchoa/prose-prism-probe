
import { useState } from "react";
import { AssessmentData } from "@/types/assessment";
import { useWritingScores, useInsightsGeneration } from "./writing";
import { toast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

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
      
      // Step 2: Generate insights based on scores
      console.log("Step 2: Generating insights based on scores");
      const finalData = await generateInsights(updatedData);
      
      if (!finalData) {
        console.error("Insights generation failed");
        return;
      }
      
      // Step 3: Verify data persistence with a fresh fetch
      console.log("Step 3: Verifying data persistence");
      if (finalData && finalData.id) {
        try {
          const refreshedDoc = await getDoc(doc(db, "assessments", finalData.id));
          if (refreshedDoc.exists()) {
            const refreshedData = {
              id: refreshedDoc.id,
              ...refreshedDoc.data()
            } as AssessmentData;
            
            console.log("Final verification - refreshed assessment data:", {
              hasAiSummary: !!refreshedData.aiSummary,
              summaryLength: refreshedData.aiSummary?.length || 0,
              strengthsCount: refreshedData.strengths?.length || 0,
              weaknessesCount: refreshedData.weaknesses?.length || 0
            });
            
            setAssessmentData(refreshedData);
            
            // Add success toast if everything looks good
            if (refreshedData.aiSummary && refreshedData.strengths && refreshedData.weaknesses) {
              toast({
                title: "Evaluation Complete",
                description: "Assessment has been successfully evaluated and insights generated.",
              });
            } else {
              // Something is missing in the saved data
              console.error("Final verification shows missing data");
              toast({
                title: "Partial Success",
                description: "Some data may not have saved correctly. Try regenerating insights if summary is missing.",
                variant: "destructive",
              });
            }
          } else {
            console.error("Document not found during verification");
          }
        } catch (verifyError) {
          console.error("Error during final verification:", verifyError);
        }
      }
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
      const updatedData = await generateInsights();
      
      // Verify data persistence with a fresh fetch
      if (updatedData && updatedData.id) {
        const refreshedDoc = await getDoc(doc(db, "assessments", updatedData.id));
        if (refreshedDoc.exists()) {
          const refreshedData = {
            id: refreshedDoc.id,
            ...refreshedDoc.data()
          } as AssessmentData;
          
          console.log("After regenerate - refreshed assessment data:", {
            hasAiSummary: !!refreshedData.aiSummary,
            summaryLength: refreshedData.aiSummary?.length || 0,
            strengthsCount: refreshedData.strengths?.length || 0,
            weaknessesCount: refreshedData.weaknesses?.length || 0
          });
          
          setAssessmentData(refreshedData);
          
          // Add success toast if everything looks good
          if (refreshedData.aiSummary && refreshedData.strengths && refreshedData.weaknesses) {
            toast({
              title: "Insights Regenerated",
              description: "Assessment insights have been successfully regenerated.",
            });
          } else {
            // Something is missing in the saved data
            toast({
              title: "Partial Success",
              description: "Some insights may not have saved correctly.",
              variant: "destructive",
            });
          }
        }
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
