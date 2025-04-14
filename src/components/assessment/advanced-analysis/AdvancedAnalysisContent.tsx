
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Brain, FileQuestion, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import WritingAnalysisTab from "./WritingAnalysisTab";
import PersonalityInsightsTab from "./PersonalityInsightsTab";
import InterviewQuestionsTab from "./InterviewQuestionsTab";
import ProfileMatchTab from "./ProfileMatchTab";
import { getConfidenceBadgeColor, getCategoryBadgeColor, getAnalysisButtonLabel } from "./utils";
import { 
  PersonalityInsight, 
  InterviewQuestion, 
  DetailedAnalysis,
  CandidateProfileMatch
} from "@/services/geminiService";

interface AdvancedAnalysisContentProps {
  assessmentData: any;
  getProgressColor: (value: number) => string;
  generateAdvancedAnalysis: (analysisType: string) => Promise<any>;
  generatingAnalysis: {[key: string]: boolean};
}

const AdvancedAnalysisContent: React.FC<AdvancedAnalysisContentProps> = ({
  assessmentData,
  getProgressColor,
  generateAdvancedAnalysis,
  generatingAnalysis = {}
}) => {
  const [activeTab, setActiveTab] = useState<string>("writing");
  const [loading, setLoading] = useState<{[key: string]: boolean}>({
    writing: false,
    personality: false,
    questions: false,
    profile: false
  });
  const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedAnalysis | null>(null);
  const [personalityInsights, setPersonalityInsights] = useState<PersonalityInsight[] | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[] | null>(null);
  const [profileMatch, setProfileMatch] = useState<CandidateProfileMatch | null>(null);

  // Initialize the tab data from assessmentData if available
  useEffect(() => {
    if (assessmentData) {
      console.log("AdvancedAnalysisContent received updated assessmentData:", assessmentData);
      
      if (assessmentData.detailedWritingAnalysis) {
        console.log("Setting detailed analysis from assessmentData:", assessmentData.detailedWritingAnalysis);
        setDetailedAnalysis(assessmentData.detailedWritingAnalysis);
      }
      
      if (assessmentData.personalityInsights) {
        console.log("Setting personality insights from assessmentData:", assessmentData.personalityInsights);
        setPersonalityInsights(assessmentData.personalityInsights);
      }
      
      if (assessmentData.interviewQuestions) {
        console.log("Setting interview questions from assessmentData:", assessmentData.interviewQuestions);
        setInterviewQuestions(assessmentData.interviewQuestions);
      }
      
      if (assessmentData.profileMatch) {
        console.log("Setting profile match from assessmentData:", assessmentData.profileMatch);
        setProfileMatch(assessmentData.profileMatch);
      }
    }
  }, [assessmentData]);

  // Update loading states from props
  useEffect(() => {
    if (generatingAnalysis) {
      setLoading({
        writing: generatingAnalysis.detailed || false,
        personality: generatingAnalysis.personality || false,
        questions: generatingAnalysis.questions || false,
        profile: generatingAnalysis.profile || false
      });
    }
  }, [generatingAnalysis]);

  const handleGenerateAnalysis = async (analysisType: string) => {
    if (!assessmentData.overallWritingScore) {
      toast({
        title: "Writing Not Evaluated",
        description: "Please evaluate the writing first to generate advanced analysis.",
        variant: "destructive"
      });
      return;
    }

    try {
      let result;
      
      switch(analysisType) {
        case "writing":
          result = await generateAdvancedAnalysis("detailed");
          if (result) setDetailedAnalysis(result);
          break;
        case "personality":
          result = await generateAdvancedAnalysis("personality");
          if (result) setPersonalityInsights(result);
          break;
        case "questions":
          result = await generateAdvancedAnalysis("questions");
          if (result) setInterviewQuestions(result);
          break;
        case "profile":
          result = await generateAdvancedAnalysis("profile");
          if (result) setProfileMatch(result);
          break;
      }
    } catch (error) {
      console.error(`Error in handleGenerateAnalysis for ${analysisType}:`, error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-6"
      >
        <div className="bg-white rounded-lg shadow-sm border">
          <TabsList className="w-full h-auto p-1 bg-gray-50 rounded-t-lg border-b">
            <TabsTrigger 
              value="writing" 
              className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Writing Analysis</span>
              <span className="sm:hidden">Writing</span>
            </TabsTrigger>
            <TabsTrigger 
              value="personality" 
              className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Personality</span>
              <span className="sm:hidden">Traits</span>
            </TabsTrigger>
            <TabsTrigger 
              value="questions" 
              className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <FileQuestion className="h-4 w-4" />
              <span className="hidden sm:inline">Interview Questions</span>
              <span className="sm:hidden">Questions</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Profile Match</span>
              <span className="sm:hidden">Match</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            {/* Writing Analysis Tab */}
            <TabsContent value="writing" className="mt-0">
              <WritingAnalysisTab 
                detailedAnalysis={detailedAnalysis}
                loading={loading.writing}
                handleGenerateAnalysis={() => handleGenerateAnalysis("writing")}
                getAnalysisButtonLabel={(type) => getAnalysisButtonLabel(type, !!detailedAnalysis)}
              />
            </TabsContent>

            {/* Personality Insights Tab */}
            <TabsContent value="personality" className="mt-0">
              <PersonalityInsightsTab 
                personalityInsights={personalityInsights}
                loading={loading.personality}
                handleGenerateAnalysis={() => handleGenerateAnalysis("personality")}
                getAnalysisButtonLabel={(type) => getAnalysisButtonLabel(type, !!personalityInsights)}
                getConfidenceBadgeColor={getConfidenceBadgeColor}
                getProgressColor={getProgressColor}
              />
            </TabsContent>

            {/* Interview Questions Tab */}
            <TabsContent value="questions" className="mt-0">
              <InterviewQuestionsTab 
                interviewQuestions={interviewQuestions}
                loading={loading.questions}
                handleGenerateAnalysis={() => handleGenerateAnalysis("questions")}
                getAnalysisButtonLabel={(type) => getAnalysisButtonLabel(type, !!interviewQuestions)}
                getCategoryBadgeColor={getCategoryBadgeColor}
              />
            </TabsContent>

            {/* Profile Match Tab */}
            <TabsContent value="profile" className="mt-0">
              <ProfileMatchTab 
                profileMatch={profileMatch}
                loading={loading.profile}
                handleGenerateAnalysis={() => handleGenerateAnalysis("profile")}
                getAnalysisButtonLabel={(type) => getAnalysisButtonLabel(type, !!profileMatch)}
                getProgressColor={getProgressColor}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalysisContent;
