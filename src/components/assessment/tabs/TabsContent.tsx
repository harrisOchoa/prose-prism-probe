
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import OverviewTab from "@/components/assessment/tabs/OverviewTab";
import { AptitudeTab } from "@/components/assessment/tabs/AptitudeTab";
import WritingTab from "@/components/assessment/tabs/WritingTab";
import AdvancedAnalysisTab from "@/components/assessment/AdvancedAnalysisTab";
import CandidateComparison from "@/components/assessment/tabs/ComparisonTab";

interface AssessmentTabsContentProps {
  assessmentData: any;
  generatingSummary: boolean;
  generatingAnalysis: Record<string, boolean>;
  calculations: {
    getAptitudeScorePercentage: () => number;
    getWritingScorePercentage: () => number;
    getOverallScore: () => number;
    getProgressColor: (value: number) => string;
    getScoreColor: (score: number) => string;
    getScoreBgColor: (score: number) => string;
    getScoreLabel: (score: number) => string;
  };
  generateAdvancedAnalysis: (type: string) => Promise<any>;
}

const AssessmentTabsContent: React.FC<AssessmentTabsContentProps> = ({
  assessmentData,
  generatingSummary,
  generatingAnalysis,
  calculations,
  generateAdvancedAnalysis
}) => {
  return (
    <div id="assessment-content">
      <TabsContent value="overview" className="space-y-4 md:space-y-6">
        <OverviewTab 
          assessmentData={assessmentData}
          generatingSummary={generatingSummary}
          getAptitudeScorePercentage={calculations.getAptitudeScorePercentage}
          getWritingScorePercentage={calculations.getWritingScorePercentage}
          getOverallScore={calculations.getOverallScore}
          getProgressColor={calculations.getProgressColor}
        />
      </TabsContent>
      
      <TabsContent value="aptitude" className="space-y-3 md:space-y-4">
        <AptitudeTab 
          assessmentData={assessmentData}
          getAptitudeScorePercentage={calculations.getAptitudeScorePercentage}
          generateAdvancedAnalysis={generateAdvancedAnalysis}
          generatingAnalysis={generatingAnalysis}
        />
      </TabsContent>
      
      <TabsContent value="writing" className="space-y-3 md:space-y-4">
        <WritingTab 
          assessmentData={assessmentData}
          getScoreColor={calculations.getScoreColor}
          getScoreBgColor={calculations.getScoreBgColor}
          getScoreLabel={calculations.getScoreLabel}
        />
      </TabsContent>
      
      <TabsContent value="advanced" className="space-y-3 md:space-y-4">
        <AdvancedAnalysisTab 
          assessmentData={assessmentData}
          getProgressColor={calculations.getProgressColor}
          generateAdvancedAnalysis={generateAdvancedAnalysis}
          generatingAnalysis={generatingAnalysis || {}}
        />
      </TabsContent>
      
      <TabsContent value="comparison" className="space-y-3 md:space-y-4">
        <CandidateComparison 
          assessmentData={assessmentData}
          getAptitudeScorePercentage={calculations.getAptitudeScorePercentage}
          getWritingScorePercentage={calculations.getWritingScorePercentage}
          getOverallScore={calculations.getOverallScore}
        />
      </TabsContent>
    </div>
  );
};

export default AssessmentTabsContent;
