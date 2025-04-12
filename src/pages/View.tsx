
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import AssessmentDetails from "@/components/AssessmentDetails";
import { toast } from "@/hooks/use-toast";
import { WritingScore, generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/geminiService";
import { WritingPromptItem } from "@/components/AssessmentManager";

// Define the type for assessment data
interface AssessmentData {
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
  [key: string]: any; // For any other properties that might exist
}

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
          
          // Check if there are writing scores and if any have errors
          if (!assessmentData.writingScores || assessmentData.writingScores.length === 0) {
            console.log("No writing scores found in assessment data");
            toast({
              title: "Writing Scores Missing",
              description: "This assessment does not have AI-evaluated writing scores. Use the 'Evaluate Writing' button to start evaluation.",
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
            
            // Generate AI summary if writing scores exist but no summary yet
            if (!assessmentData.aiSummary || !assessmentData.strengths || !assessmentData.weaknesses) {
              setGeneratingSummary(true);
              console.log("Generating AI insights for assessment");
              
              try {
                const [summary, analysis] = await Promise.all([
                  generateCandidateSummary(assessmentData),
                  generateStrengthsAndWeaknesses(assessmentData)
                ]);
                
                assessmentData.aiSummary = summary;
                assessmentData.strengths = analysis.strengths;
                assessmentData.weaknesses = analysis.weaknesses;
                
                // Update the assessment in Firestore with the new AI insights
                await updateDoc(docRef, {
                  aiSummary: summary,
                  strengths: analysis.strengths,
                  weaknesses: analysis.weaknesses
                });
                
                console.log("AI insights saved to assessment:", assessmentData);
              } catch (aiError) {
                console.error("Error generating AI insights:", aiError);
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

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-hirescribe-primary mb-4" />
        <p>Loading assessment data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate('/admin')}
            >
              Back to Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {assessment ? (
        <AssessmentDetails 
          assessment={assessment} 
          onBack={() => navigate('/admin')} 
          isGeneratingSummary={generatingSummary}
        />
      ) : (
        <div className="text-center">
          <p>No assessment found with ID: {id}</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/admin')}
          >
            Back to Admin
          </Button>
        </div>
      )}
    </div>
  );
};

export default View;
