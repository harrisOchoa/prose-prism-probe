
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { updateAssessmentAnalysis } from "@/firebase/assessmentService";
import { 
  evaluateAllWritingPrompts,
  generateCandidateSummary,
  generateStrengthsAndWeaknesses
} from "@/services/geminiService";
import { AssessmentData } from "@/types/assessment";

/**
 * Hook for handling writing evaluation functionality
 */
export const useWritingEvaluation = (assessmentData: any, setAssessmentData: (data: any) => void) => {
  const [evaluating, setEvaluating] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const handleManualEvaluation = async () => {
    if (!assessmentData.completedPrompts || assessmentData.completedPrompts.length === 0) {
      toast({
        title: "No Writing Prompts",
        description: "This assessment does not have any completed writing prompts to evaluate.",
        variant: "destructive",
      });
      return;
    }

    try {
      setEvaluating(true);
      toast({
        title: "Evaluation Started",
        description: "The system is now evaluating the writing responses. This may take a moment.",
      });

      const scores = await evaluateAllWritingPrompts(assessmentData.completedPrompts);
      
      if (scores.length === 0) {
        throw new Error("No scores were returned from evaluation");
      }

      const validScores = scores.filter(score => score.score > 0);
      const overallScore = validScores.length > 0
        ? Number((validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length).toFixed(1))
        : 0;

      console.log("Writing scores calculated:", scores);
      console.log("Overall writing score:", overallScore);

      // Update local state first for immediate feedback
      const updatedData = {
        ...assessmentData,
        writingScores: scores,
        overallWritingScore: overallScore
      };
      setAssessmentData(updatedData);

      // Update Firebase with the writing scores
      try {
        await updateAssessmentAnalysis(assessmentData.id, {
          writingScores: scores,
          overallWritingScore: overallScore
        });
        
        console.log("Successfully saved writing scores to database");
      } catch (updateError) {
        console.error("Failed to save writing scores to database:", updateError);
        throw new Error("Failed to save evaluation results to database");
      }

      setGeneratingSummary(true);
      toast({
        title: "Generating Insights",
        description: "System is now analyzing the assessment to provide additional insights.",
      });
      
      try {
        // Generate insights based on the updated data
        const [summary, analysis] = await Promise.all([
          generateCandidateSummary(updatedData),
          generateStrengthsAndWeaknesses(updatedData)
        ]);
        
        // Update local state with insights immediately
        const dataWithInsights = {
          ...updatedData,
          aiSummary: summary,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses
        };
        
        setAssessmentData(dataWithInsights);
        
        // Update Firebase with the insights
        await updateAssessmentAnalysis(assessmentData.id, {
          aiSummary: summary,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses
        });
        
        console.log("Insights generated and saved to database:", { summary, analysis });
        
        // Double-check the data was saved by retrieving it again
        const updatedDoc = await getDoc(doc(db, "assessments", assessmentData.id));
        if (updatedDoc.exists()) {
          const refreshedData = {
            id: updatedDoc.id,
            ...updatedDoc.data()
          } as AssessmentData;
          
          console.log("Final assessment data after everything:", refreshedData);
          // Only update if there are differences to avoid unnecessary re-renders
          if (
            refreshedData.aiSummary !== dataWithInsights.aiSummary || 
            !refreshedData.strengths || 
            !refreshedData.weaknesses
          ) {
            setAssessmentData(refreshedData);
          }
        }
      } catch (aiError) {
        console.error("Error generating insights:", aiError);
        toast({
          title: "Insight Generation Failed",
          description: "There was an error generating insights. The evaluation scores were saved successfully.",
          variant: "destructive",
        });
      } finally {
        setGeneratingSummary(false);
      }

      toast({
        title: "Evaluation Complete",
        description: `Successfully evaluated ${validScores.length} of ${scores.length} writing prompts.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error during manual evaluation:", error);
      toast({
        title: "Evaluation Failed",
        description: `There was an error evaluating the writing: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setEvaluating(false);
    }
  };
  
  const regenerateInsights = async () => {
    if (!assessmentData.writingScores || assessmentData.writingScores.length === 0) {
      toast({
        title: "No Writing Scores",
        description: "Please evaluate the writing first to generate insights.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setGeneratingSummary(true);
      toast({
        title: "Regenerating Insights",
        description: "System is analyzing the assessment to provide updated insights.",
      });
      
      // Generate insights
      const [summary, analysis] = await Promise.all([
        generateCandidateSummary(assessmentData),
        generateStrengthsAndWeaknesses(assessmentData)
      ]);
      
      // Update local state first
      const updatedData = {
        ...assessmentData,
        aiSummary: summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses
      };
      
      setAssessmentData(updatedData);
      
      // Update Firebase with the new insights
      await updateAssessmentAnalysis(assessmentData.id, {
        aiSummary: summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses
      });
      
      console.log("Successfully saved regenerated insights to database");
      
      // Verify data persistence with a fresh fetch
      const updatedDoc = await getDoc(doc(db, "assessments", assessmentData.id));
      if (updatedDoc.exists()) {
        const refreshedData = {
          id: updatedDoc.id,
          ...updatedDoc.data()
        } as AssessmentData;
        
        console.log("Retrieved updated assessment data after regenerating insights:", refreshedData);
        setAssessmentData(refreshedData);
      }
      
      toast({
        title: "Insights Updated",
        description: "Assessment insights have been regenerated successfully.",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Failed to Regenerate Insights",
        description: `Error: ${error.message}`,
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
