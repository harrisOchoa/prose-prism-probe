
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
    try {
      const updatedData = await evaluateWritingResponses();
      
      if (updatedData) {
        setGeneratingSummary(true);
        const finalData = await generateInsights(updatedData);
        
        // Verify data persistence with a fresh fetch after everything is done
        if (finalData && finalData.id) {
          const refreshedDoc = await getDoc(doc(db, "assessments", finalData.id));
          if (refreshedDoc.exists()) {
            const refreshedData = {
              id: refreshedDoc.id,
              ...refreshedDoc.data()
            } as AssessmentData;
            
            console.log("Final verification - refreshed assessment data:", refreshedData);
            setAssessmentData(refreshedData);
            
            // Add success toast
            toast({
              title: "Evaluation Complete",
              description: "Assessment has been successfully evaluated and insights generated.",
            });
          }
        }
      }
    } catch (error) {
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
          
          console.log("After regenerate - refreshed assessment data:", refreshedData);
          setAssessmentData(refreshedData);
        }
      }
    } catch (error) {
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
