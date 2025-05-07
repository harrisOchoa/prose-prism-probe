
import React, { useState, useEffect, useCallback } from "react";
import { Tabs } from "@/components/ui/tabs";
import AssessmentHeader from "@/components/assessment/AssessmentHeader";
import CandidateSummaryCard from "@/components/assessment/CandidateSummaryCard";
import { useAssessmentCalculations } from "@/hooks/useAssessmentCalculations";
import { useAssessmentEvaluation } from "@/hooks/useAssessmentEvaluation";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import AssessmentTabsList from "./assessment/tabs/TabsList";
import AssessmentTabsContent from "./assessment/tabs/TabsContent";

interface AssessmentDetailsProps {
  assessment: any;
  onBack: () => void;
  isGeneratingSummary?: boolean;
  refreshAssessment?: () => Promise<any>;
}

const AssessmentDetails: React.FC<AssessmentDetailsProps> = ({ 
  assessment, 
  onBack,
  isGeneratingSummary = false,
  refreshAssessment
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [assessmentData, setAssessmentData] = useState(assessment);
  const isMobile = useIsMobile();
  const [renderKey, setRenderKey] = useState(Date.now().toString());
  
  // Get activeTab from URL query parameter or default to "overview"
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "overview";
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  
  const calculations = useAssessmentCalculations(assessmentData);
  
  const {
    evaluating,
    generatingSummary,
    generatingAnalysis,
    handleManualEvaluation,
    regenerateInsights,
    generateAdvancedAnalysis,
    setGeneratingSummary
  } = useAssessmentEvaluation(assessmentData, setAssessmentData);

  const { handleExportPdf } = usePdfExport();

  // Update local state when assessment prop changes
  useEffect(() => {
    if (assessment && JSON.stringify(assessment) !== JSON.stringify(assessmentData)) {
      console.log("Assessment prop updated, updating local state");
      setAssessmentData(assessment);
      // Force re-render of components
      setRenderKey(Date.now().toString());
    }
  }, [assessment, assessmentData]);
  
  // Set initial state for generatingSummary if provided
  useEffect(() => {
    if (isGeneratingSummary) {
      setGeneratingSummary(true);
    }
  }, [isGeneratingSummary, setGeneratingSummary]);
  
  // Update URL when tab changes
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    navigate(`${location.pathname}?tab=${value}`, { replace: true });
    // Force re-render when changing tabs
    setRenderKey(Date.now().toString());
    
    // Auto-refresh data when changing to advanced tab to get latest analyses
    if (value === 'advanced' && refreshAssessment) {
      refreshAssessment().then(updatedData => {
        if (updatedData) {
          setAssessmentData(updatedData);
        }
      });
    }
  }, [location.pathname, navigate, refreshAssessment]);

  // Handle back with potential refresh
  const handleBack = useCallback(async () => {
    // Attempt to refresh data before navigating back
    if (refreshAssessment) {
      try {
        await refreshAssessment();
      } catch (error) {
        console.error("Error refreshing assessment before navigation:", error);
      }
    }
    onBack();
  }, [onBack, refreshAssessment]);

  // Enhanced advanced analysis function
  const handleGenerateAdvancedAnalysis = async (type: string) => {
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
  };

  // Get the current tab for PDF export
  const getCurrentTabContentType = (): "Overview" | "Aptitude" | "Writing" | "WritingAnalysis" | "Personality" | "ProfileMatch" | "InterviewQuestions" => {
    switch (activeTab) {
      case "aptitude":
        return "Aptitude";
      case "writing":
        return "Writing";
      case "advanced":
        // Could be refined further based on sub-tabs if needed
        return "WritingAnalysis";
      case "comparison":
        return "ProfileMatch";
      case "overview":
      default:
        return "Overview";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <AssessmentHeader 
        assessmentData={assessmentData}
        onBack={handleBack}
        evaluating={evaluating}
        generatingSummary={generatingSummary}
        handleManualEvaluation={handleManualEvaluation}
        regenerateInsights={regenerateInsights}
        handleExportPdf={(data, contentType) => 
          handleExportPdf(data, contentType || getCurrentTabContentType())
        }
      />

      <CandidateSummaryCard 
        assessmentData={assessmentData}
        getOverallScore={calculations.getOverallScore}
      />

      <Tabs key={renderKey} value={activeTab} onValueChange={handleTabChange} className="space-y-3 md:space-y-4">
        <AssessmentTabsList isMobile={isMobile} />
        <AssessmentTabsContent 
          assessmentData={assessmentData}
          generatingSummary={generatingSummary}
          generatingAnalysis={generatingAnalysis}
          calculations={calculations}
          generateAdvancedAnalysis={handleGenerateAdvancedAnalysis}
        />
      </Tabs>
    </div>
  );
};

export default AssessmentDetails;
