
import { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast } from "@/hooks/use-toast";
import { AssessmentData } from "@/types/assessment";

export const useFetchAssessment = (id: string | undefined) => {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a memoized fetchAssessment function that can be called on demand
  const fetchAssessment = useCallback(async (assessmentId: string) => {
    try {
      console.log(`[${new Date().toISOString()}] Fetching assessment with ID:`, assessmentId);
      setLoading(true);
      
      const docRef = doc(db, "assessments", assessmentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const assessmentData = {
          id: docSnap.id,
          ...docSnap.data()
        } as AssessmentData;
        
        console.log("Assessment data retrieved:", {
          id: assessmentData.id,
          hasAiSummary: !!assessmentData.aiSummary,
          hasStrengths: !!(assessmentData.strengths && assessmentData.strengths.length > 0),
          hasWeaknesses: !!(assessmentData.weaknesses && assessmentData.weaknesses.length > 0),
          hasWritingScores: !!(assessmentData.writingScores && assessmentData.writingScores.length > 0)
        });
        
        setAssessment(assessmentData);
        setError(null);
        return assessmentData;
      } else {
        setError("Assessment not found");
        console.log("Assessment document does not exist");
        return null;
      }
    } catch (err) {
      console.error("Error fetching assessment:", err);
      setError("Failed to load assessment");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    if (!id) {
      setError("Assessment ID is missing");
      setLoading(false);
      return;
    }
    
    fetchAssessment(id);
  }, [id, fetchAssessment]);

  return { 
    assessment, 
    setAssessment, 
    loading, 
    error, 
    refreshAssessment: fetchAssessment 
  };
};
