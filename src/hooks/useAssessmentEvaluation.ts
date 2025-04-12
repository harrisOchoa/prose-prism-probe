
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { evaluateAllWritingPrompts, generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/geminiService";

export const useAssessmentEvaluation = (assessmentData: any, setAssessmentData: (data: any) => void) => {
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
        title: "AI Evaluation Started",
        description: "The AI is now evaluating the writing responses. This may take a moment.",
      });

      const scores = await evaluateAllWritingPrompts(assessmentData.completedPrompts);
      
      if (scores.length === 0) {
        throw new Error("No scores were returned from evaluation");
      }

      const validScores = scores.filter(score => score.score > 0);
      const overallScore = validScores.length > 0
        ? Number((validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length).toFixed(1))
        : 0;

      const assessmentRef = doc(db, "assessments", assessmentData.id);
      
      await updateDoc(assessmentRef, {
        writingScores: scores,
        overallWritingScore: overallScore
      });

      setGeneratingSummary(true);
      toast({
        title: "Generating Insights",
        description: "AI is now analyzing the assessment to provide additional insights.",
      });
      
      try {
        const [summary, analysis] = await Promise.all([
          generateCandidateSummary({...assessmentData, writingScores: scores, overallWritingScore: overallScore}),
          generateStrengthsAndWeaknesses({...assessmentData, writingScores: scores, overallWritingScore: overallScore})
        ]);
        
        await updateDoc(assessmentRef, {
          aiSummary: summary,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses
        });
        
        console.log("AI insights generated:", { summary, analysis });
      } catch (aiError) {
        console.error("Error generating AI insights:", aiError);
        toast({
          title: "Insight Generation Failed",
          description: "There was an error generating AI insights. The evaluation scores were saved successfully.",
          variant: "destructive",
        });
      } finally {
        setGeneratingSummary(false);
      }

      const updatedDoc = await getDoc(assessmentRef);
      if (updatedDoc.exists()) {
        const updatedData = {
          id: updatedDoc.id,
          ...updatedDoc.data()
        };
        
        setAssessmentData(updatedData);
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
        description: "AI is analyzing the assessment to provide updated insights.",
      });
      
      const [summary, analysis] = await Promise.all([
        generateCandidateSummary(assessmentData),
        generateStrengthsAndWeaknesses(assessmentData)
      ]);
      
      const assessmentRef = doc(db, "assessments", assessmentData.id);
      await updateDoc(assessmentRef, {
        aiSummary: summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses
      });
      
      setAssessmentData({
        ...assessmentData,
        aiSummary: summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses
      });
      
      toast({
        title: "Insights Updated",
        description: "AI insights have been regenerated successfully.",
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
