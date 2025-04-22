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
  aptitudeAnswers?: number[];
  aptitudeData?: {
    answers: number[];
    questions: any[];
    correctAnswers: number;
  };
  aptitudeCategories?: Array<{
    name: string;
    correct: number;
    total: number;
    source?: string;
  }>;
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
          console.log("Raw aptitude data:", {
            aptitudeScore: assessmentData.aptitudeScore,
            aptitudeTotal: assessmentData.aptitudeTotal,
            aptitudeAnswers: assessmentData.aptitudeAnswers,
            aptitudeData: assessmentData.aptitudeData
          });
          
          // Recovery of aptitude score if it's missing
          if (assessmentData.aptitudeScore === undefined || assessmentData.aptitudeScore === null) {
            console.log("Aptitude score is missing, attempting recovery...");
            
            // Try to recover from aptitudeAnswers if available
            if (assessmentData.aptitudeAnswers && Array.isArray(assessmentData.aptitudeAnswers)) {
              console.log("Recovery attempt from aptitudeAnswers:", assessmentData.aptitudeAnswers);
              const correctAnswerIndices = assessmentData.aptitudeData?.correctAnswers; 
              
              if (correctAnswerIndices) {
                // If we have the count of correct answers
                console.log(`Using provided correct answers count: ${correctAnswerIndices}`);
                const recoveredScore = correctAnswerIndices;
                assessmentData.aptitudeScore = recoveredScore;
              } else {
                // Otherwise calculate based on non-zero entries (works for old data format)
                const recoveredScore = assessmentData.aptitudeAnswers.filter(a => a !== 0).length;
                console.log(`Calculated score from non-zero answers: ${recoveredScore}`);
                assessmentData.aptitudeScore = recoveredScore;
              }
              console.log(`Recovered aptitude score from answers: ${assessmentData.aptitudeScore}`);
            }
            // Try to recover from aptitudeData if available
            else if (assessmentData.aptitudeData && assessmentData.aptitudeData.correctAnswers !== undefined) {
              console.log(`Recovering aptitude score from aptitudeData.correctAnswers:`, assessmentData.aptitudeData.correctAnswers);
              assessmentData.aptitudeScore = assessmentData.aptitudeData.correctAnswers;
            }
            // Default to 0 if no recovery is possible
            else {
              console.log("No aptitude data available for recovery, defaulting to 0");
              assessmentData.aptitudeScore = 0;
            }
          } else {
            console.log("Aptitude score already exists:", assessmentData.aptitudeScore);
          }
          
          // Ensure aptitudeTotal is set
          if (assessmentData.aptitudeTotal === undefined || assessmentData.aptitudeTotal === null) {
            console.log("Aptitude total is missing, setting default value");
            assessmentData.aptitudeTotal = 30; // Default to 30 questions
          } else {
            console.log("Aptitude total already exists:", assessmentData.aptitudeTotal);
          }
          
          // Generate aptitude categories if they don't exist
          if (!assessmentData.aptitudeCategories || !Array.isArray(assessmentData.aptitudeCategories) || assessmentData.aptitudeCategories.length === 0) {
            console.log("Generating aptitude categories...");
            
            // Create sample categories based on aptitude score
            const totalQuestions = assessmentData.aptitudeTotal;
            const correctAnswers = assessmentData.aptitudeScore;
            
            // Simple algorithm to distribute scores across categories
            const logicalCorrect = Math.floor(correctAnswers * 0.3);
            const numericalCorrect = Math.floor(correctAnswers * 0.25);
            const verbalCorrect = Math.floor(correctAnswers * 0.25);
            const problemSolvingCorrect = correctAnswers - logicalCorrect - numericalCorrect - verbalCorrect;
            
            assessmentData.aptitudeCategories = [
              { name: "Logical Reasoning", correct: logicalCorrect, total: Math.ceil(totalQuestions * 0.3), source: "Generated" },
              { name: "Numerical Analysis", correct: numericalCorrect, total: Math.ceil(totalQuestions * 0.25), source: "Generated" },
              { name: "Verbal Comprehension", correct: verbalCorrect, total: Math.ceil(totalQuestions * 0.25), source: "Generated" },
              { name: "Problem Solving", correct: problemSolvingCorrect, total: totalQuestions - Math.ceil(totalQuestions * 0.3) - Math.ceil(totalQuestions * 0.25) - Math.ceil(totalQuestions * 0.25), source: "Generated" }
            ];
            
            console.log("Generated aptitude categories:", assessmentData.aptitudeCategories);
          } else {
            console.log("Using existing aptitude categories:", assessmentData.aptitudeCategories);
          }
          
          console.log("Final aptitude score:", assessmentData.aptitudeScore, "/", assessmentData.aptitudeTotal);
          
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
