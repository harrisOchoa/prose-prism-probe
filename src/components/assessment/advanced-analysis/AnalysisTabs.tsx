
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Brain, FileQuestion, Target, Calculator } from "lucide-react";
import WritingAnalysisTab from "./WritingAnalysisTab";
import PersonalityInsightsTab from "./PersonalityInsightsTab";
import InterviewQuestionsTab from "./InterviewQuestionsTab";
import ProfileMatchTab from "./ProfileMatchTab";
import AptitudeAnalysisTab from "./AptitudeAnalysisTab";
import { DetailedAnalysis, PersonalityInsight, InterviewQuestion, CandidateProfileMatch, AptitudeAnalysis } from "@/services/geminiService";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnalysisTabsProps {
  assessmentData: any;
  loading: {[key: string]: boolean};
  handleGenerateAnalysis: (analysisType: string) => void;
  getAnalysisButtonLabel: (type: string) => string;
  getProgressColor: (value: number) => string;
  getConfidenceBadgeColor: (confidence: number) => string;
  getCategoryBadgeColor: (category: string) => string;
  detailedAnalysis: DetailedAnalysis | null;
  personalityInsights: PersonalityInsight[] | null;
  interviewQuestions: InterviewQuestion[] | null;
  profileMatch: CandidateProfileMatch | null;
  aptitudeAnalysis: AptitudeAnalysis | null;
}

const AnalysisTabs: React.FC<AnalysisTabsProps> = ({
  assessmentData,
  loading,
  handleGenerateAnalysis,
  getAnalysisButtonLabel,
  getProgressColor,
  getConfidenceBadgeColor,
  getCategoryBadgeColor,
  detailedAnalysis,
  personalityInsights,
  interviewQuestions,
  profileMatch,
  aptitudeAnalysis
}) => {
  const [activeTab, setActiveTab] = useState<string>("writing");
  const isMobile = useIsMobile();

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="space-y-4 md:space-y-6"
    >
      <div className="bg-white rounded-lg shadow-sm border">
        <TabsList className={`w-full h-auto p-1 bg-gray-50 rounded-t-lg border-b ${isMobile ? 'flex-wrap justify-center' : ''}`}>
          <TabsTrigger 
            value="writing" 
            className={`flex items-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm ${isMobile ? 'text-xs' : ''}`}
          >
            <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Writing Analysis</span>
            <span className="sm:hidden">Writing</span>
          </TabsTrigger>
          <TabsTrigger 
            value="personality" 
            className={`flex items-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm ${isMobile ? 'text-xs' : ''}`}
          >
            <Brain className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Personality</span>
            <span className="sm:hidden">Traits</span>
          </TabsTrigger>
          <TabsTrigger 
            value="questions" 
            className={`flex items-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm ${isMobile ? 'text-xs' : ''}`}
          >
            <FileQuestion className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Interview Questions</span>
            <span className="sm:hidden">Questions</span>
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className={`flex items-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm ${isMobile ? 'text-xs' : ''}`}
          >
            <Target className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Profile Match</span>
            <span className="sm:hidden">Match</span>
          </TabsTrigger>
          <TabsTrigger 
            value="aptitude" 
            className={`flex items-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm ${isMobile ? 'text-xs' : ''}`}
          >
            <Calculator className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Aptitude Analysis</span>
            <span className="sm:hidden">Aptitude</span>
          </TabsTrigger>
        </TabsList>

        <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
          <TabsContent value="writing" className="mt-0">
            <WritingAnalysisTab 
              detailedAnalysis={detailedAnalysis}
              loading={loading.writing}
              handleGenerateAnalysis={() => handleGenerateAnalysis("writing")}
              getAnalysisButtonLabel={() => getAnalysisButtonLabel("writing")}
            />
          </TabsContent>

          <TabsContent value="personality" className="mt-0">
            <PersonalityInsightsTab 
              personalityInsights={personalityInsights}
              loading={loading.personality}
              handleGenerateAnalysis={() => handleGenerateAnalysis("personality")}
              getAnalysisButtonLabel={() => getAnalysisButtonLabel("personality")}
              getConfidenceBadgeColor={getConfidenceBadgeColor}
              getProgressColor={getProgressColor}
            />
          </TabsContent>

          <TabsContent value="questions" className="mt-0">
            <InterviewQuestionsTab 
              interviewQuestions={interviewQuestions}
              loading={loading.questions}
              handleGenerateAnalysis={() => handleGenerateAnalysis("questions")}
              getAnalysisButtonLabel={() => getAnalysisButtonLabel("questions")}
              getCategoryBadgeColor={getCategoryBadgeColor}
            />
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <ProfileMatchTab 
              profileMatch={profileMatch}
              loading={loading.profile}
              handleGenerateAnalysis={() => handleGenerateAnalysis("profile")}
              getAnalysisButtonLabel={() => getAnalysisButtonLabel("profile")}
              getProgressColor={getProgressColor}
            />
          </TabsContent>

          <TabsContent value="aptitude" className="mt-0">
            <AptitudeAnalysisTab 
              aptitudeAnalysis={aptitudeAnalysis}
              loading={loading.aptitude}
              handleGenerateAnalysis={() => handleGenerateAnalysis("aptitude")}
              getAnalysisButtonLabel={() => getAnalysisButtonLabel("aptitude")}
            />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};

export default AnalysisTabs;
