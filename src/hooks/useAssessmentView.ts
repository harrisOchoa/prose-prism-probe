
import { useState } from "react";
import { generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/geminiService";
import { updateAssessmentAnalysis } from "@/firebase/assessmentService";
import { toast } from "@/hooks/use-toast";
import { useFetchAssessment } from "./assessment/useFetchAssessment";
import { useAptitudeRecovery } from "./assessment/useAptitudeRecovery";
import { useAptitudeCategories } from "./assessment/useAptitudeCategories";

export interface AssessmentData {
  id: string;
  candidateName: string;
  candidatePosition: string;
  aptitudeScore: number;
  aptitudeTotal: number;
  completedPrompts: any[];
  wordCount: number;
  writingScores?: any[];
  overallWritingScore?: number;
  submittedAt: any;
  aiSummary?: string;
  strengths?: string[];
  weaknesses?: string[];
  [key: string]: any;
}

export const useAssessmentView = (id: string | undefined) => {
  const { assessment, setAssessment, loading, error } = useFetchAssessment(id);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const { recoverAptitudeScore } = useAptitudeRecovery(assessment);
  const { generateAptitudeCategories } = useAptitudeCategories(assessment);

  // Process assessment data when it's loaded
  const processAssessmentData = async (data: AssessmentData) => {
    let updatedData = recoverAptitudeScore(data);
    updatedData = generateAptitudeCategories(updatedData);

    if (updatedData.writingScores && updatedData.writingScores.length > 0) {
      const errorScores = updatedData.writingScores.filter(score => score.score === 0);
      if (errorScores.length > 0) {
        console.log("Found error scores:", errorScores);
        toast({
          title: "Writing Evaluation Errors",
          description: `${errorScores.length} writing prompt(s) could not be evaluated. Try using the 'Evaluate Writing' button to retry.`,
          variant: "destructive",
        });
      }

      if (!updatedData.aiSummary || !updatedData.strengths || !updatedData.weaknesses) {
        setGeneratingSummary(true);
        console.log("Generating insights for assessment");

        try {
          const [summary, analysis] = await Promise.all([
            generateCandidateSummary(updatedData),
            generateStrengthsAndWeaknesses(updatedData)
          ]);

          updatedData = {
            ...updatedData,
            aiSummary: summary,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses
          };

          await updateAssessmentAnalysis(updatedData.id, {
            aiSummary: summary,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses
          });

          console.log("Insights saved to assessment:", updatedData);
        } catch (aiError) {
          console.error("Error generating insights:", aiError);
        } finally {
          setGeneratingSummary(false);
        }
      }
    } else {
      console.log("No writing scores found in assessment data");
      toast({
        title: "Writing Scores Missing",
        description: "This assessment does not have evaluated writing scores. Use the 'Evaluate Writing' button to start evaluation.",
        variant: "destructive",
      });
    }

    return updatedData;
  };

  // Update assessment data when it changes
  if (assessment) {
    processAssessmentData(assessment).then(updatedData => {
      if (JSON.stringify(updatedData) !== JSON.stringify(assessment)) {
        setAssessment(updatedData);
      }
    });
  }

  return {
    assessment,
    loading,
    error,
    generatingSummary,
    setAssessment
  };
};
