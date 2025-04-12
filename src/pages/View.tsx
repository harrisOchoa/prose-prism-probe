
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import AssessmentDetails from "@/components/AssessmentDetails";
import { toast } from "@/hooks/use-toast";

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          const assessmentData = {
            id: docSnap.id,
            ...docSnap.data()
          };
          
          console.log("Assessment data retrieved:", assessmentData);
          
          // Check if there are writing scores
          if (!assessmentData.writingScores || assessmentData.writingScores.length === 0) {
            console.log("No writing scores found in assessment data");
            toast({
              title: "Writing Scores Missing",
              description: "This assessment does not have AI-evaluated writing scores.",
              variant: "destructive",
            });
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
