
import { useState, useEffect } from "react";
import { generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/geminiService";
import { updateAssessmentAnalysis } from "@/firebase/assessmentService";
import { toast } from "@/hooks/use-toast";
import { useFetchAssessment } from "./assessment/useFetchAssessment";
import { useAptitudeRecovery } from "./assessment/useAptitudeRecovery";
import { useAptitudeCategories } from "./assessment/useAptitudeCategories";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { AssessmentData } from "@/types/assessment";

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
  useEffect(() => {
    const processData = async () => {
      if (!assessment || !assessment.id) return;
      
      console.log("Processing assessment data in useEffect:", assessment.id);
      
      let updatedData = recoverAptitudeScore(assessment);
      updatedData = generateAptitudeCategories(updatedData);

      // If writing scores exist but we're missing summary data, generate it
      if (updatedData.writingScores && 
          updatedData.writingScores.length > 0 && 
          updatedData.writingScores.some(score => score.score > 0) &&
          (!updatedData.aiSummary || !updatedData.strengths || !updatedData.weaknesses)) {
        
        console.log("Missing insights detected, attempting to generate");
        setGeneratingSummary(true);
        
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

          console.log("Auto-generated insights saved to assessment:", updatedData);
          
          // Verify the update by re-fetching
          const refreshedDoc = await getDoc(doc(db, "assessments", updatedData.id));
          if (refreshedDoc.exists()) {
            const refreshedData = {
              id: refreshedDoc.id,
              ...refreshedDoc.data()
            } as AssessmentData;
            
            console.log("Refreshed data after auto-generation:", refreshedData);
            setAssessment(refreshedData);
            return; // Skip the setAssessment below
          }
        } catch (aiError) {
          console.error("Error auto-generating insights:", aiError);
        } finally {
          setGeneratingSummary(false);
        }
      } else if (
        updatedData.writingScores && 
        updatedData.writingScores.length > 0 && 
        updatedData.writingScores.some(score => score.score === 0)
      ) {
        console.log("Found error scores, notifying user");
        toast({
          title: "Writing Evaluation Issues",
          description: `Some writing prompts could not be evaluated. Try using the 'Evaluate Writing' button to retry.`,
          variant: "default",
        });
      }

      if (JSON.stringify(updatedData) !== JSON.stringify(assessment)) {
        setAssessment(updatedData);
      }
    };

    if (assessment) {
      processData();
    }
  }, [assessment?.id]);

  return {
    assessment,
    loading,
    error,
    generatingSummary,
    setAssessment,
    setGeneratingSummary
  };
};
