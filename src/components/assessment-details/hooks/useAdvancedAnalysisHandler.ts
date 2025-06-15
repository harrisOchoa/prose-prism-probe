
import { useCallback } from "react";

interface UseAdvancedAnalysisHandlerProps {
  generateAdvancedAnalysis: (type: string) => Promise<any>;
  refreshAssessment?: () => Promise<any>;
  setAssessmentData: (data: any) => void;
  setRenderKey: (key: string) => void;
}

export const useAdvancedAnalysisHandler = ({
  generateAdvancedAnalysis,
  refreshAssessment,
  setAssessmentData,
  setRenderKey
}: UseAdvancedAnalysisHandlerProps) => {
  
  // Enhanced advanced analysis function
  const handleGenerateAdvancedAnalysis = useCallback(async (type: string) => {
    try {
      console.log(`AssessmentDetails: Requesting ${type} analysis generation`);
      const result = await generateAdvancedAnalysis(type);
      
      if (result) {
        console.log(`AssessmentDetails: Analysis generated successfully for ${type}`);
        // Force re-render on successful analysis generation
        setRenderKey(Date.now().toString());
        
        // Refresh data after generation to ensure we have the latest
        if (refreshAssessment) {
          const refreshedData = await refreshAssessment();
          if (refreshedData) {
            setAssessmentData(refreshedData);
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error(`AssessmentDetails: Error generating ${type} analysis:`, error);
      return null;
    }
  }, [generateAdvancedAnalysis, refreshAssessment, setAssessmentData, setRenderKey]);

  return { handleGenerateAdvancedAnalysis };
};
