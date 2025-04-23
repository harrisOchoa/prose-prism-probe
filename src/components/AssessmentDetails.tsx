import React, { useState, useEffect } from "react";
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
}

const AssessmentDetails: React.FC<AssessmentDetailsProps> = ({ 
  assessment, 
  onBack,
  isGeneratingSummary = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [assessmentData, setAssessmentData] = useState(assessment);
  const isMobile = useIsMobile();
  
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

  // Log initial assessment data for debugging
  useEffect(() => {
    console.log("Initial assessment data in AssessmentDetails:", assessmentData);
    
    // Log any advanced analysis data that exists
    if (assessmentData.detailedWritingAnalysis) {
      console.log("Detailed writing analysis loaded:", assessmentData.detailedWritingAnalysis);
    }
    
    if (assessmentData.personalityInsights) {
      console.log("Personality insights loaded:", assessmentData.personalityInsights);
    }
    
    if (assessmentData.interviewQuestions) {
      console.log("Interview questions loaded:", assessmentData.interviewQuestions);
    }
    
    if (assessmentData.profileMatch) {
      console.log("Profile match data loaded:", assessmentData.profileMatch);
    }
  }, [assessmentData]);

  // Set initial state for generatingSummary if provided
  useEffect(() => {
    if (isGeneratingSummary) {
      setGeneratingSummary(true);
    }
  }, [isGeneratingSummary, setGeneratingSummary]);
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`${location.pathname}?tab=${value}`, { replace: true });
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
        onBack={onBack}
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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-3 md:space-y-4">
        <AssessmentTabsList isMobile={isMobile} />
        <AssessmentTabsContent 
          assessmentData={assessmentData}
          generatingSummary={generatingSummary}
          generatingAnalysis={generatingAnalysis}
          calculations={calculations}
          generateAdvancedAnalysis={generateAdvancedAnalysis}
        />
      </Tabs>
    </div>
  );
};

export default AssessmentDetails;
