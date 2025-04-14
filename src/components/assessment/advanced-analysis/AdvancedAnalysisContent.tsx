
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WritingAnalysisTab from "./WritingAnalysisTab";
import PersonalityInsightsTab from "./PersonalityInsightsTab";
import ProfileMatchTab from "./ProfileMatchTab";
import InterviewQuestionsTab from "./InterviewQuestionsTab";
import { getProgressColor, getConfidenceBadgeColor, getAnalysisButtonLabel } from "./utils";

interface AdvancedAnalysisContentProps {
  assessmentData: any;
  getProgressColor: (value: number) => string;
  generateAdvancedAnalysis: (analysisType: string) => Promise<any>;
  generatingAnalysis: {[key: string]: boolean};
}

const AdvancedAnalysisContent: React.FC<AdvancedAnalysisContentProps> = ({
  assessmentData,
  getProgressColor: getScoreProgressColor,
  generateAdvancedAnalysis,
  generatingAnalysis = {}
}) => {
  // Get the initial tab based on what's already generated
  const getInitialTab = () => {
    if (assessmentData.detailedWritingAnalysis) return "writing-analysis";
    if (assessmentData.personalityInsights) return "personality";
    if (assessmentData.profileMatch) return "profile";
    if (assessmentData.interviewQuestions) return "interview";
    return "writing-analysis";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full rounded-none bg-muted/50 p-0 border-b">
        <TabsTrigger 
          value="writing-analysis"
          className="flex-1 py-3 data-[state=active]:bg-background rounded-none data-[state=active]:shadow"
          data-tab="writing-analysis"
        >
          Writing Analysis
        </TabsTrigger>
        <TabsTrigger 
          value="personality"
          className="flex-1 py-3 data-[state=active]:bg-background rounded-none data-[state=active]:shadow"
          data-tab="personality"
        >
          Personality Insights
        </TabsTrigger>
        <TabsTrigger 
          value="profile"
          className="flex-1 py-3 data-[state=active]:bg-background rounded-none data-[state=active]:shadow"
          data-tab="profile"
        >
          Profile Match
        </TabsTrigger>
        <TabsTrigger 
          value="interview"
          className="flex-1 py-3 data-[state=active]:bg-background rounded-none data-[state=active]:shadow"
          data-tab="interview"
        >
          Interview Questions
        </TabsTrigger>
      </TabsList>
      
      <div className="p-6">
        <TabsContent value="writing-analysis" className="mt-0">
          <WritingAnalysisTab
            detailedAnalysis={assessmentData.detailedWritingAnalysis}
            loading={generatingAnalysis.writing || false}
            handleGenerateAnalysis={() => generateAdvancedAnalysis('writing')}
            getAnalysisButtonLabel={getAnalysisButtonLabel}
          />
        </TabsContent>
        
        <TabsContent value="personality" className="mt-0">
          <PersonalityInsightsTab
            personalityInsights={assessmentData.personalityInsights}
            loading={generatingAnalysis.personality || false}
            handleGenerateAnalysis={() => generateAdvancedAnalysis('personality')}
            getAnalysisButtonLabel={getAnalysisButtonLabel}
            getConfidenceBadgeColor={getConfidenceBadgeColor}
            getProgressColor={getProgressColor}
          />
        </TabsContent>
        
        <TabsContent value="profile" className="mt-0">
          <ProfileMatchTab
            profileMatch={assessmentData.profileMatch}
            loading={generatingAnalysis.profile || false}
            handleGenerateAnalysis={() => generateAdvancedAnalysis('profile')}
            getAnalysisButtonLabel={getAnalysisButtonLabel}
            getProgressColor={getProgressColor}
          />
        </TabsContent>
        
        <TabsContent value="interview" className="mt-0 pdf-hide">
          <InterviewQuestionsTab
            interviewQuestions={assessmentData.interviewQuestions}
            loading={generatingAnalysis.interview || false}
            handleGenerateAnalysis={() => generateAdvancedAnalysis('interview')}
            getAnalysisButtonLabel={getAnalysisButtonLabel}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default AdvancedAnalysisContent;
