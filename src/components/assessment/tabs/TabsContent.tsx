
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import LazyLoader from "@/components/common/LazyLoader";
import { 
  LazyOverviewTab,
  LazyAptitudeTab, 
  LazyWritingTab,
  LazyAdvancedAnalysisTab,
  LazyCandidateComparison 
} from "./lazy/LazyTabComponents";

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
        <LazyLoader>
          <LazyOverviewTab 
            assessmentData={assessmentData}
            generatingSummary={generatingSummary}
            getAptitudeScorePercentage={calculations.getAptitudeScorePercentage}
            getWritingScorePercentage={calculations.getWritingScorePercentage}
            getOverallScore={calculations.getOverallScore}
            getProgressColor={calculations.getProgressColor}
          />
        </LazyLoader>
      </TabsContent>
      
      <TabsContent value="aptitude" className="space-y-3 md:space-y-4">
        <LazyLoader>
          <LazyAptitudeTab 
            assessmentData={assessmentData}
            getAptitudeScorePercentage={calculations.getAptitudeScorePercentage}
            generateAdvancedAnalysis={generateAdvancedAnalysis}
            generatingAnalysis={generatingAnalysis}
          />
        </LazyLoader>
      </TabsContent>
      
      <TabsContent value="writing" className="space-y-3 md:space-y-4">
        <LazyLoader>
          <LazyWritingTab 
            assessmentData={assessmentData}
            getScoreColor={calculations.getScoreColor}
            getScoreBgColor={calculations.getScoreBgColor}
            getScoreLabel={calculations.getScoreLabel}
          />
        </LazyLoader>
      </TabsContent>
      
      <TabsContent value="advanced" className="space-y-3 md:space-y-4">
        <LazyLoader>
          <LazyAdvancedAnalysisTab 
            assessmentData={assessmentData}
            getProgressColor={calculations.getProgressColor}
            generateAdvancedAnalysis={generateAdvancedAnalysis}
            generatingAnalysis={generatingAnalysis || {}}
          />
        </LazyLoader>
      </TabsContent>
      
      <TabsContent value="comparison" className="space-y-3 md:space-y-4">
        <LazyLoader>
          <LazyCandidateComparison 
            assessmentData={assessmentData}
            getAptitudeScorePercentage={calculations.getAptitudeScorePercentage}
            getWritingScorePercentage={calculations.getWritingScorePercentage}
            getOverallScore={calculations.getOverallScore}
          />
        </LazyLoader>
      </TabsContent>
    </div>
  );
};

export default AssessmentTabsContent;
