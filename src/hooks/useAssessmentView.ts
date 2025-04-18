
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { updateAssessmentAnalysis } from "@/firebase/assessmentService";
import { toast } from "@/hooks/use-toast";
import { generateCandidateSummary, generateStrengthsAndWeaknesses, WritingScore } from "@/services/geminiService";
import { WritingPromptItem } from "@/components/AssessmentManager";

export interface AssessmentData {
  id: string;
  candidateName: string;
  candidatePosition: string;
  aptitudeScore: number;
  aptitudeTotal: number;
  completedPrompts: WritingPromptItem[];
  wordCount: number;
  writingScores?: WritingScore[];
  overallWritingScore?: number;
  submittedAt: any;
  aiSummary?: string;
  strengths?: string[];
  weaknesses?: string[];
  detailedWritingAnalysis?: any;
  personalityInsights?: any[];
  interviewQuestions?: any[];
  profileMatch?: any;
  [key: string]: any;
}

export const useAssessmentView = (id: string | undefined) => {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!id) {
        setError("Assessment ID is missing");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching assessment with ID:", id);
        const docRef = doc(db, "assessments", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const assessmentData: AssessmentData = {
            id: docSnap.id,
            ...docSnap.data()
          } as AssessmentData;
          
          console.log("Assessment data retrieved:", assessmentData);
          
          // Log advanced analysis data for debugging
          if (assessmentData.detailedWritingAnalysis) {
            console.log("Detailed writing analysis found:", assessmentData.detailedWritingAnalysis);
          }
          
          if (assessmentData.personalityInsights) {
            console.log("Personality insights found:", assessmentData.personalityInsights);
          }
          
          if (assessmentData.interviewQuestions) {
            console.log("Interview questions found:", assessmentData.interviewQuestions);
          }
          
          if (assessmentData.profileMatch) {
            console.log("Profile match data found:", assessmentData.profileMatch);
          }
          
          if (!assessmentData.writingScores || assessmentData.writingScores.length === 0) {
            console.log("No writing scores found in assessment data");
            toast({
              title: "Writing Scores Missing",
              description: "This assessment does not have evaluated writing scores. Use the 'Evaluate Writing' button to start evaluation.",
              variant: "destructive",
            });
          } else {
            const errorScores = assessmentData.writingScores.filter(score => score.score === 0);
            if (errorScores.length > 0) {
              console.log("Found error scores:", errorScores);
              toast({
                title: "Writing Evaluation Errors",
                description: `${errorScores.length} writing prompt(s) could not be evaluated. Try using the 'Evaluate Writing' button to retry.`,
                variant: "destructive",
              });
            }
            
            if (!assessmentData.aiSummary || !assessmentData.strengths || !assessmentData.weaknesses) {
              setGeneratingSummary(true);
              console.log("Generating insights for assessment");
              
              try {
                const [summary, analysis] = await Promise.all([
                  generateCandidateSummary(assessmentData),
                  generateStrengthsAndWeaknesses(assessmentData)
                ]);
                
                // Update assessment data in memory
                assessmentData.aiSummary = summary;
                assessmentData.strengths = analysis.strengths;
                assessmentData.weaknesses = analysis.weaknesses;
                
                // Save to Firebase
                await updateAssessmentAnalysis(assessmentData.id, {
                  aiSummary: summary,
                  strengths: analysis.strengths,
                  weaknesses: analysis.weaknesses
                });
                
                console.log("Insights saved to assessment:", assessmentData);
              } catch (aiError) {
                console.error("Error generating insights:", aiError);
              } finally {
                setGeneratingSummary(false);
              }
            }
          }
          
          setAssessment(assessmentData);
        } else {
          setError("Assessment not found");
          console.log("Assessment document does not exist");
        }
      } catch (err) {
        console.error("Error fetching assessment:", err);
        setError("Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  return {
    assessment,
    loading,
    error,
    generatingSummary,
    setAssessment
  };
};
