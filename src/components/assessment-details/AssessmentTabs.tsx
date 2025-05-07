
import React from "react";
import { Tabs } from "@/components/ui/tabs";
import AssessmentTabsList from "@/components/assessment/tabs/TabsList";
import AssessmentTabsContent from "@/components/assessment/tabs/TabsContent";

interface AssessmentTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
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
  isMobile: boolean;
}

const AssessmentTabs: React.FC<AssessmentTabsProps> = ({
  activeTab,
  onTabChange,
  assessmentData,
  generatingSummary,
  generatingAnalysis,
  calculations,
  generateAdvancedAnalysis,
  isMobile
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-3 md:space-y-4">
      <AssessmentTabsList isMobile={isMobile} />
      <AssessmentTabsContent 
        assessmentData={assessmentData}
        generatingSummary={generatingSummary}
        generatingAnalysis={generatingAnalysis}
        calculations={calculations}
        generateAdvancedAnalysis={generateAdvancedAnalysis}
      />
    </Tabs>
  );
};

export default AssessmentTabs;
