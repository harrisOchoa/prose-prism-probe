
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
      if (assessmentData.detailedWritingAnalysis) {
        setDetailedAnalysis(assessmentData.detailedWritingAnalysis);
      }
      
      if (assessmentData.personalityInsights) {
        setPersonalityInsights(assessmentData.personalityInsights);
      }
      
      if (assessmentData.interviewQuestions) {
        setInterviewQuestions(assessmentData.interviewQuestions);
      }
      
      if (assessmentData.profileMatch) {
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

  // Update state after new data comes in
  useEffect(() => {
    if (assessmentData.detailedWritingAnalysis && !detailedAnalysis) {
      setDetailedAnalysis(assessmentData.detailedWritingAnalysis);
    }
    
    if (assessmentData.personalityInsights && !personalityInsights) {
      setPersonalityInsights(assessmentData.personalityInsights);
    }
    
    if (assessmentData.interviewQuestions && !interviewQuestions) {
      setInterviewQuestions(assessmentData.interviewQuestions);
    }
    
    if (assessmentData.profileMatch && !profileMatch) {
      setProfileMatch(assessmentData.profileMatch);
    }
  }, [
    assessmentData.detailedWritingAnalysis, 
    assessmentData.personalityInsights,
    assessmentData.interviewQuestions,
    assessmentData.profileMatch
  ]);

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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid grid-cols-4 gap-2">
        <TabsTrigger value="writing" className="flex items-center gap-1">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Writing Analysis</span>
          <span className="sm:hidden">Writing</span>
        </TabsTrigger>
        <TabsTrigger value="personality" className="flex items-center gap-1">
          <Brain className="h-4 w-4" />
          <span className="hidden sm:inline">Personality</span>
          <span className="sm:hidden">Traits</span>
        </TabsTrigger>
        <TabsTrigger value="questions" className="flex items-center gap-1">
          <FileQuestion className="h-4 w-4" />
          <span className="hidden sm:inline">Interview Questions</span>
          <span className="sm:hidden">Questions</span>
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex items-center gap-1">
          <Target className="h-4 w-4" />
          <span className="hidden sm:inline">Profile Match</span>
          <span className="sm:hidden">Match</span>
        </TabsTrigger>
      </TabsList>

      {/* Writing Analysis Tab */}
      <TabsContent value="writing">
        <WritingAnalysisTab 
          detailedAnalysis={detailedAnalysis}
          loading={loading.writing}
          handleGenerateAnalysis={() => handleGenerateAnalysis("writing")}
          getAnalysisButtonLabel={(type) => getAnalysisButtonLabel(type, !!detailedAnalysis)}
        />
      </TabsContent>

      {/* Personality Insights Tab */}
      <TabsContent value="personality">
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
      <TabsContent value="questions">
        <InterviewQuestionsTab 
          interviewQuestions={interviewQuestions}
          loading={loading.questions}
          handleGenerateAnalysis={() => handleGenerateAnalysis("questions")}
          getAnalysisButtonLabel={(type) => getAnalysisButtonLabel(type, !!interviewQuestions)}
          getCategoryBadgeColor={getCategoryBadgeColor}
        />
      </TabsContent>

      {/* Profile Match Tab */}
      <TabsContent value="profile">
        <ProfileMatchTab 
          profileMatch={profileMatch}
          loading={loading.profile}
          handleGenerateAnalysis={() => handleGenerateAnalysis("profile")}
          getAnalysisButtonLabel={(type) => getAnalysisButtonLabel(type, !!profileMatch)}
          getProgressColor={getProgressColor}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AdvancedAnalysisContent;
