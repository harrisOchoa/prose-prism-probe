
import { useState, useEffect, useCallback } from "react";
import { AssessmentData } from "@/types/assessment";
import { useFetchAssessment } from "../assessment/useFetchAssessment";
import { useAptitudeRecovery } from "../assessment/useAptitudeRecovery";
import { useAptitudeCategories } from "../assessment/useAptitudeCategories";
import { processAssessmentData } from "./helpers/processAssessmentData";
import { enrichAssessmentData, createAssessmentCopy } from "./helpers/enrichAssessmentData";

export const useAssessmentView = (id: string | undefined) => {
  const { assessment, setAssessment, loading, error, refreshAssessment } = useFetchAssessment(id);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const { recoverAptitudeScore } = useAptitudeRecovery(assessment);
  const { generateAptitudeCategories } = useAptitudeCategories(assessment);

  // Process assessment data when it's loaded
  useEffect(() => {
    if (!assessment || !assessment.id) return;
    
    // Step 1: Enrich data with aptitude recovery and categories
    const enrichedData = enrichAssessmentData(
      assessment,
      recoverAptitudeScore,
      generateAptitudeCategories
    );
    
    // Step 2: If data was enriched, update state immediately
    if (JSON.stringify(enrichedData) !== JSON.stringify(assessment)) {
      console.log("Assessment data has been enriched, updating state");
      setAssessment(createAssessmentCopy(enrichedData));
    }
    
    // Step 3: Process assessment data for insights asynchronously
    processAssessmentData(enrichedData, setAssessment, setGeneratingSummary);
    
  }, [assessment?.id, assessment, setAssessment, recoverAptitudeScore, generateAptitudeCategories]);

  // Function to manually refresh assessment data
  const refresh = useCallback(async () => {
    if (id) {
      console.log("Manually refreshing assessment data");
      const refreshedData = await refreshAssessment(id);
      if (refreshedData) {
        console.log("Assessment data refreshed successfully");
        // Create a deep copy to ensure React detects the change
        setAssessment(createAssessmentCopy(refreshedData));
      }
      return refreshedData;
    }
    return null;
  }, [id, refreshAssessment, setAssessment]);

  return {
    assessment,
    loading,
    error,
    generatingSummary,
    setAssessment,
    setGeneratingSummary,
    refreshAssessment: refresh
  };
};
