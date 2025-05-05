
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { evaluateAllWritingPrompts } from "@/services/geminiService";
import { updateAssessmentAnalysis } from "@/firebase/assessmentService";
import { AssessmentData } from "@/types/assessment";

/**
 * Hook for handling writing evaluation scoring functionality
 */
export const useWritingScores = (
  assessmentData: AssessmentData, 
  setAssessmentData: (data: AssessmentData) => void
) => {
  const [evaluating, setEvaluating] = useState(false);

  const evaluateWritingResponses = async () => {
    if (!assessmentData.completedPrompts || assessmentData.completedPrompts.length === 0) {
      toast({
        title: "No Writing Prompts",
        description: "This assessment does not have any completed writing prompts to evaluate.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setEvaluating(true);
      toast({
        title: "Evaluation Started",
        description: "The system is now evaluating the writing responses. This may take a moment.",
      });

      console.log("Starting evaluation for", assessmentData.completedPrompts.length, "prompts");
      const scores = await evaluateAllWritingPrompts(assessmentData.completedPrompts);
      
      if (!scores || scores.length === 0) {
        throw new Error("No scores were returned from evaluation");
      }

      const validScores = scores.filter(score => score.score > 0);
      console.log("Valid scores count:", validScores.length, "out of", scores.length);
      
      if (validScores.length === 0) {
        toast({
          title: "Evaluation Incomplete",
          description: "Could not evaluate any writing prompts successfully. Please try again.",
          variant: "destructive",
        });
        return null;
      }
      
      const overallScore = validScores.length > 0
        ? Number((validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length).toFixed(1))
        : 0;

      console.log("Writing scores calculated:", scores);
      console.log("Overall writing score:", overallScore);
      console.log("Valid scores count:", validScores.length);

      // Update local state immediately for immediate feedback
      const updatedData = {
        ...assessmentData,
        writingScores: scores,
        overallWritingScore: overallScore
      };
      
      // Update the UI immediately
      setAssessmentData(updatedData);

      // Update Firebase with the writing scores
      try {
        console.log("Saving writing scores to Firebase for assessment", assessmentData.id);
        await updateAssessmentAnalysis(assessmentData.id, {
          writingScores: scores,
          overallWritingScore: overallScore
        });
        
        console.log("Successfully saved writing scores to database");
        toast({
          title: "Evaluation Complete",
          description: `Successfully evaluated ${validScores.length} of ${scores.length} writing prompts.`,
          variant: "default",
        });
      } catch (updateError) {
        console.error("Failed to save writing scores to database:", updateError);
        toast({
          title: "Save Failed",
          description: "Failed to save evaluation results to database, but they are available in your current session.",
          variant: "destructive",
        });
      }

      return updatedData;
    } catch (error: any) {
      console.error("Error during writing evaluation:", error);
      toast({
        title: "Evaluation Failed",
        description: `There was an error evaluating the writing: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setEvaluating(false);
    }
  };

  return {
    evaluating,
    evaluateWritingResponses
  };
};
