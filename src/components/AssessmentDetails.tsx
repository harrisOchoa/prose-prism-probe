
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssessmentHeader from "@/components/assessment/AssessmentHeader";
import CandidateSummaryCard from "@/components/assessment/CandidateSummaryCard";
import OverviewTab from "@/components/assessment/tabs/OverviewTab";
import AptitudeTab from "@/components/assessment/tabs/AptitudeTab";
import WritingTab from "@/components/assessment/tabs/WritingTab";
import CandidateComparison from "@/components/assessment/tabs/ComparisonTab";
import AdvancedAnalysisTab from "@/components/assessment/AdvancedAnalysisTab";
import { useAssessmentCalculations } from "@/hooks/useAssessmentCalculations";
import { useAssessmentEvaluation } from "@/hooks/useAssessmentEvaluation";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useNavigate, useLocation } from "react-router-dom";

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
    <div className="space-y-6">
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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="w-full bg-muted/50 p-0">
          <TabsTrigger value="overview" className="flex-1 py-3 data-[state=active]:bg-background rounded-none data-[state=active]:shadow">
            Overview
          </TabsTrigger>
          <TabsTrigger value="aptitude" className="flex-1 py-3 data-[state=active]:bg-background rounded-none data-[state=active]:shadow">
            Aptitude Results
          </TabsTrigger>
          <TabsTrigger value="writing" className="flex-1 py-3 data-[state=active]:bg-background rounded-none data-[state=active]:shadow">
            Writing Assessment
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex-1 py-3 data-[state=active]:bg-background rounded-none data-[state=active]:shadow">
            Advanced Analysis
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex-1 py-3 data-[state=active]:bg-background rounded-none data-[state=active]:shadow">
            Comparison
          </TabsTrigger>
        </TabsList>
        
        <div id="assessment-content">
          <TabsContent value="overview" className="space-y-6">
            <OverviewTab 
              assessmentData={assessmentData}
              generatingSummary={generatingSummary}
              getAptitudeScorePercentage={calculations.getAptitudeScorePercentage}
              getWritingScorePercentage={calculations.getWritingScorePercentage}
              getOverallScore={calculations.getOverallScore}
              getProgressColor={calculations.getProgressColor}
            />
          </TabsContent>
          
          <TabsContent value="aptitude" className="space-y-4">
            <AptitudeTab 
              assessmentData={assessmentData}
              getAptitudeScorePercentage={calculations.getAptitudeScorePercentage}
            />
          </TabsContent>
          
          <TabsContent value="writing" className="space-y-4">
            <WritingTab 
              assessmentData={assessmentData}
              getScoreColor={calculations.getScoreColor}
              getScoreBgColor={calculations.getScoreBgColor}
              getScoreLabel={calculations.getScoreLabel}
            />
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <AdvancedAnalysisTab 
              assessmentData={assessmentData}
              getProgressColor={calculations.getProgressColor}
              generateAdvancedAnalysis={generateAdvancedAnalysis}
              generatingAnalysis={generatingAnalysis || {}}
            />
          </TabsContent>
          
          <TabsContent value="comparison" className="space-y-4">
            <CandidateComparison 
              assessmentData={assessmentData}
              getAptitudeScorePercentage={calculations.getAptitudeScorePercentage}
              getWritingScorePercentage={calculations.getWritingScorePercentage}
              getOverallScore={calculations.getOverallScore}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AssessmentDetails;
