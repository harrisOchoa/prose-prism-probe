import React, { useEffect, useCallback, memo } from "react";
import { useOptimizedAssessmentCalculations } from "@/hooks/useOptimizedAssessmentCalculations";
import { useAssessmentEvaluation } from "@/hooks/useAssessmentEvaluation";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useIsMobile } from "@/hooks/use-mobile";
import AssessmentHeader from "@/components/assessment/AssessmentHeader";
import CandidateSummaryCard from "@/components/assessment/CandidateSummaryCard";
import AssessmentTabs from "./AssessmentTabs";
import { toast } from "@/hooks/use-toast";
import { useAssessmentDetailsState } from "./hooks/useAssessmentDetailsState";
import { useAdvancedAnalysisHandler } from "./hooks/useAdvancedAnalysisHandler";
import { shallowEqual } from "@/utils/shallowCompare";

interface OptimizedAssessmentDetailsContainerProps {
  assessment: any;
  onBack: () => void;
  isGeneratingSummary?: boolean;
  refreshAssessment?: () => Promise<any>;
}

const OptimizedAssessmentDetailsContainer: React.FC<OptimizedAssessmentDetailsContainerProps> = memo(({ 
  assessment, 
  onBack,
  isGeneratingSummary = false,
  refreshAssessment
}) => {
  const isMobile = useIsMobile();
  
  // Extract state management with memoization
  const {
    assessmentData,
    setAssessmentData,
    renderKey,
    setRenderKey,
    activeTab,
    handleTabChange
  } = useAssessmentDetailsState(assessment);
  
  // Use optimized calculations hook
  const calculations = useOptimizedAssessmentCalculations(assessmentData);
  
  const {
    evaluating,
    generatingSummary,
    generatingAnalysis,
    handleManualEvaluation,
    regenerateInsights,
    generateAdvancedAnalysis,
    setGeneratingSummary
  } = useAssessmentEvaluation(assessmentData, setAssessmentData);

  const { handleExportPdf, exporting } = usePdfExport();

  // Extract advanced analysis handler with memoization
  const { handleGenerateAdvancedAnalysis } = useAdvancedAnalysisHandler({
    generateAdvancedAnalysis,
    refreshAssessment,
    setAssessmentData,
    setRenderKey
  });
  
  // Memoize the initial state effect
  useEffect(() => {
    if (isGeneratingSummary) {
      setGeneratingSummary();
    }
  }, [isGeneratingSummary, setGeneratingSummary]);
  
  // Memoize tab change handler
  const handleTabChangeWithRefresh = useCallback((value: string) => {
    handleTabChange(value);
    
    // Auto-refresh data when changing to advanced tab to get latest analyses
    if (value === 'advanced' && refreshAssessment) {
      refreshAssessment().then(updatedData => {
        if (updatedData) {
          setAssessmentData(updatedData);
        }
      });
    }
  }, [handleTabChange, refreshAssessment, setAssessmentData]);

  // Memoize back handler
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

  // Memoize PDF export handler
  const handleExportPdfWithSections = useCallback(async (
    assessmentData: {
      candidateName: string;
      candidatePosition: string;
    },
    contentType: "Overview" | "Aptitude" | "Writing" | "WritingAnalysis" | "Personality" | "ProfileMatch" | "InterviewQuestions" | string[],
    templateName?: string
  ) => {
    // For single section exports, make sure we're on the right tab
    if (!Array.isArray(contentType)) {
      // Switch to the appropriate tab
      const tabValue = contentType.toLowerCase();
      if (activeTab !== tabValue) {
        handleTabChangeWithRefresh(tabValue);
        
        // Give the UI time to update before exporting
        setTimeout(() => {
          handleExportPdf(assessmentData, contentType);
        }, 300);
        return;
      }
    }
    
    try {
      await handleExportPdf(assessmentData, contentType, templateName);
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error creating the PDF. Please try again.",
        variant: "destructive"
      });
    }
  }, [activeTab, handleTabChangeWithRefresh, handleExportPdf]);

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <AssessmentHeader 
        assessmentData={assessmentData}
        onBack={handleBack}
        evaluating={evaluating}
        generatingSummary={generatingSummary}
        handleManualEvaluation={handleManualEvaluation}
        regenerateInsights={regenerateInsights}
        handleExportPdf={handleExportPdfWithSections}
      />

      <CandidateSummaryCard 
        assessmentData={assessmentData}
        getOverallScore={calculations.getOverallScore}
      />

      <AssessmentTabs 
        key={renderKey}
        activeTab={activeTab}
        onTabChange={handleTabChangeWithRefresh}
        assessmentData={assessmentData}
        generatingSummary={generatingSummary}
        generatingAnalysis={generatingAnalysis}
        calculations={calculations}
        generateAdvancedAnalysis={handleGenerateAdvancedAnalysis}
        isMobile={isMobile}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom shallow comparison for better performance
  return shallowEqual(prevProps.assessment, nextProps.assessment) &&
         prevProps.onBack === nextProps.onBack &&
         prevProps.isGeneratingSummary === nextProps.isGeneratingSummary &&
         prevProps.refreshAssessment === nextProps.refreshAssessment;
});

OptimizedAssessmentDetailsContainer.displayName = "OptimizedAssessmentDetailsContainer";

export default OptimizedAssessmentDetailsContainer;
