
import React, { useState } from "react";
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
  const [assessmentData, setAssessmentData] = useState(assessment);
  const [activeTab, setActiveTab] = useState("overview");
  
  const calculations = useAssessmentCalculations(assessmentData);
  
  const {
    evaluating,
    generatingSummary,
    handleManualEvaluation,
    regenerateInsights,
    setGeneratingSummary
  } = useAssessmentEvaluation(assessmentData, setAssessmentData);

  const { handleExportPdf } = usePdfExport();

  // Set initial state for generatingSummary if provided
  React.useEffect(() => {
    if (isGeneratingSummary) {
      setGeneratingSummary(true);
    }
  }, [isGeneratingSummary, setGeneratingSummary]);

  return (
    <div className="space-y-6">
      <AssessmentHeader 
        assessmentData={assessmentData}
        onBack={onBack}
        evaluating={evaluating}
        generatingSummary={generatingSummary}
        handleManualEvaluation={handleManualEvaluation}
        regenerateInsights={regenerateInsights}
        handleExportPdf={handleExportPdf}
      />

      <CandidateSummaryCard 
        assessmentData={assessmentData}
        getOverallScore={calculations.getOverallScore}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
