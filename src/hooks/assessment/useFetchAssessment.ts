
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast } from "@/hooks/use-toast";
import { AssessmentData } from "@/hooks/useAssessmentView";

export const useFetchAssessment = (id: string | undefined) => {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
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
          } as AssessmentData;
          
          console.log("Assessment data retrieved:", assessmentData);
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

  return { assessment, setAssessment, loading, error };
};
