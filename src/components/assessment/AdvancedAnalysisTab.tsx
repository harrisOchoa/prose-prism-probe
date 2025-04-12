
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Brain, FileQuestion, Target, 
  Loader2, AlertCircle, CheckCircle, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  PersonalityInsight, 
  InterviewQuestion, 
  DetailedAnalysis,
  CandidateProfileMatch,
  generateDetailedWritingAnalysis,
  generateInterviewQuestions,
  generatePersonalityInsights,
  compareWithIdealProfile
} from "@/services/geminiService";

interface AdvancedAnalysisTabProps {
  assessmentData: any;
  getProgressColor: (value: number) => string;
}

const AdvancedAnalysisTab: React.FC<AdvancedAnalysisTabProps> = ({
  assessmentData,
  getProgressColor
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

  const getAnalysisButtonLabel = (analysisType: string) => {
    switch(analysisType) {
      case "writing":
        return detailedAnalysis ? "Regenerate Writing Analysis" : "Generate Writing Analysis";
      case "personality":
        return personalityInsights ? "Regenerate Personality Insights" : "Generate Personality Insights";
      case "questions":
        return interviewQuestions ? "Regenerate Interview Questions" : "Generate Interview Questions";
      case "profile":
        return profileMatch ? "Regenerate Profile Comparison" : "Generate Profile Comparison";
      default:
        return "Generate Analysis";
    }
  };

  const handleGenerateAnalysis = async (analysisType: string) => {
    if (!assessmentData.overallWritingScore) {
      toast({
        title: "Writing Not Evaluated",
        description: "Please evaluate the writing first to generate advanced analysis.",
        variant: "destructive"
      });
      return;
    }

    setLoading({...loading, [analysisType]: true});
    
    try {
      switch(analysisType) {
        case "writing":
          const analysis = await generateDetailedWritingAnalysis(assessmentData);
          setDetailedAnalysis(analysis);
          break;
        case "personality":
          const insights = await generatePersonalityInsights(assessmentData);
          setPersonalityInsights(insights);
          break;
        case "questions":
          const questions = await generateInterviewQuestions(assessmentData);
          setInterviewQuestions(questions);
          break;
        case "profile":
          const match = await compareWithIdealProfile(assessmentData);
          setProfileMatch(match);
          break;
      }
      
      toast({
        title: "Analysis Complete",
        description: `Successfully generated ${analysisType} analysis.`,
      });
    } catch (error) {
      console.error(`Error generating ${analysisType} analysis:`, error);
      toast({
        title: "Analysis Failed",
        description: `Failed to generate ${analysisType} analysis. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setLoading({...loading, [analysisType]: false});
    }
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (confidence >= 60) return "bg-blue-100 text-blue-800 border-blue-200";
    if (confidence >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (confidence >= 20) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getCategoryBadgeColor = (category: string) => {
    switch(category.toLowerCase()) {
      case "technical":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "behavioral":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "situational":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Advanced AI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
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
            <TabsContent value="writing" className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleGenerateAnalysis("writing")}
                  disabled={loading.writing}
                  className="relative"
                >
                  {loading.writing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {getAnalysisButtonLabel("writing")}
                </Button>
              </div>

              {!detailedAnalysis && !loading.writing ? (
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg">
                  <BookOpen className="h-12 w-12 text-gray-300 mb-2" />
                  <h3 className="text-lg font-medium text-gray-600">No Writing Analysis Available</h3>
                  <p className="text-sm text-gray-500 max-w-md mt-1">
                    Generate detailed analysis of the candidate's writing style, vocabulary, and critical thinking.
                  </p>
                </div>
              ) : loading.writing ? (
                <div className="flex flex-col items-center justify-center p-6">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-3" />
                  <p className="text-gray-600">Analyzing writing samples...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-700 mb-2">Writing Style</h3>
                      <p className="text-sm">{detailedAnalysis?.writingStyle}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-700 mb-2">Vocabulary Level</h3>
                      <p className="text-sm">{detailedAnalysis?.vocabularyLevel}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-700 mb-2">Critical Thinking</h3>
                      <p className="text-sm">{detailedAnalysis?.criticalThinking}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-green-700 mb-2">Key Strengths</h3>
                      <ul className="space-y-2">
                        {detailedAnalysis?.strengthAreas.map((strength, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-amber-700 mb-2">Areas for Improvement</h3>
                      <ul className="space-y-2">
                        {detailedAnalysis?.improvementAreas.map((area, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Personality Insights Tab */}
            <TabsContent value="personality" className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleGenerateAnalysis("personality")}
                  disabled={loading.personality}
                >
                  {loading.personality && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {getAnalysisButtonLabel("personality")}
                </Button>
              </div>

              {!personalityInsights && !loading.personality ? (
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg">
                  <Brain className="h-12 w-12 text-gray-300 mb-2" />
                  <h3 className="text-lg font-medium text-gray-600">No Personality Insights Available</h3>
                  <p className="text-sm text-gray-500 max-w-md mt-1">
                    Generate insights about the candidate's personality traits based on their writing style.
                  </p>
                </div>
              ) : loading.personality ? (
                <div className="flex flex-col items-center justify-center p-6">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-3" />
                  <p className="text-gray-600">Analyzing personality traits...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 italic text-center">
                    Note: These insights are based on writing style analysis only and should be considered as initial impressions.
                  </p>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {personalityInsights?.map((insight, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-gray-700">{insight.trait}</h3>
                          <Badge className={`${getConfidenceBadgeColor(insight.confidence)}`}>
                            {insight.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm">{insight.description}</p>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Low</span>
                            <span>High</span>
                          </div>
                          <Progress 
                            value={insight.confidence} 
                            className="h-2"
                            color={getProgressColor(insight.confidence)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Interview Questions Tab */}
            <TabsContent value="questions" className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleGenerateAnalysis("questions")}
                  disabled={loading.questions}
                >
                  {loading.questions && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {getAnalysisButtonLabel("questions")}
                </Button>
              </div>

              {!interviewQuestions && !loading.questions ? (
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg">
                  <FileQuestion className="h-12 w-12 text-gray-300 mb-2" />
                  <h3 className="text-lg font-medium text-gray-600">No Interview Questions Available</h3>
                  <p className="text-sm text-gray-500 max-w-md mt-1">
                    Generate suggested interview questions based on the candidate's assessment results.
                  </p>
                </div>
              ) : loading.questions ? (
                <div className="flex flex-col items-center justify-center p-6">
                  <Loader2 className="h-12 w-12 animate-spin text-amber-500 mb-3" />
                  <p className="text-gray-600">Generating interview questions...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      These questions are based on the candidate's assessment results and are designed to explore both strengths and areas for improvement.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {interviewQuestions?.map((question, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                          <h3 className="font-medium">{index + 1}. {question.question}</h3>
                          <Badge className={getCategoryBadgeColor(question.category)}>
                            {question.category}
                          </Badge>
                        </div>
                        <div className="p-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Rationale:</span> {question.rationale}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Profile Match Tab */}
            <TabsContent value="profile" className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleGenerateAnalysis("profile")}
                  disabled={loading.profile}
                >
                  {loading.profile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {getAnalysisButtonLabel("profile")}
                </Button>
              </div>

              {!profileMatch && !loading.profile ? (
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg">
                  <Target className="h-12 w-12 text-gray-300 mb-2" />
                  <h3 className="text-lg font-medium text-gray-600">No Profile Comparison Available</h3>
                  <p className="text-sm text-gray-500 max-w-md mt-1">
                    Compare this candidate against an ideal profile for the position they're applying for.
                  </p>
                </div>
              ) : loading.profile ? (
                <div className="flex flex-col items-center justify-center p-6">
                  <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-3" />
                  <p className="text-gray-600">Analyzing profile match...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-medium">Match for: {profileMatch?.position}</h3>
                    <div className="w-40 h-40 relative mt-4 mb-2">
                      <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                        <div 
                          className="absolute inset-2 rounded-full flex items-center justify-center"
                          style={{
                            background: `conic-gradient(${getProgressColor(profileMatch?.matchPercentage || 0).replace('text-', 'var(--')}500) ${profileMatch?.matchPercentage || 0}%, transparent 0)`
                          }}
                        >
                          <div className="bg-white w-3/4 h-3/4 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold">{profileMatch?.matchPercentage || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Overall Match Percentage</div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-green-700 mb-2">Key Matches</h3>
                      <ul className="space-y-2">
                        {profileMatch?.keyMatches.map((match, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{match}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-red-700 mb-2">Key Gaps</h3>
                      <ul className="space-y-2">
                        {profileMatch?.keyGaps.map((gap, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalysisTab;
