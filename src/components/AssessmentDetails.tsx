import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  ArrowLeft, Check, X, AlertCircle, Zap, Clock, 
  User, Briefcase, FileText, BarChart, FileCheck, 
  ThumbsUp, ThumbsDown, BrainCircuit, Sparkles, Dices,
  Loader2, Download, Printer, HelpCircle, Users
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { scoringCriteria, WritingScore, generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/geminiService";
import { toast } from "@/hooks/use-toast";
import { evaluateAllWritingPrompts } from "@/services/geminiService";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SkillsRadarChart from "@/components/assessment/SkillsRadarChart";
import CandidateComparison from "@/components/assessment/CandidateComparison";
import { exportToPdf } from "@/utils/pdfExport";

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
  const [evaluating, setEvaluating] = useState(false);
  const [assessmentData, setAssessmentData] = useState(assessment);
  const [activeTab, setActiveTab] = useState("overview");
  const [generatingSummary, setGeneratingSummary] = useState(isGeneratingSummary);
  
  const getScoreColor = (score: number) => {
    if (score === 0) return "text-gray-600";
    if (score >= 4.5) return "text-green-600";
    if (score >= 3.5) return "text-blue-600";
    if (score >= 2.5) return "text-yellow-600";
    if (score >= 1.5) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score === 0) return "bg-gray-100";
    if (score >= 4.5) return "bg-green-50";
    if (score >= 3.5) return "bg-blue-50";
    if (score >= 2.5) return "bg-yellow-50";
    if (score >= 1.5) return "bg-orange-50";
    return "bg-red-50";
  };

  const getScoreLabel = (score: number) => {
    if (score === 0) return "Not Evaluated";
    if (score >= 4.5) return "Exceptional";
    if (score >= 3.5) return "Proficient";
    if (score >= 2.5) return "Satisfactory";
    if (score >= 1.5) return "Basic";
    return "Needs Improvement";
  };

  const getAptitudeScorePercentage = () => {
    if (!assessmentData.aptitudeTotal) return 0;
    return Math.round((assessmentData.aptitudeScore / assessmentData.aptitudeTotal) * 100);
  };

  const getWritingScorePercentage = () => {
    if (!assessmentData.overallWritingScore) return 0;
    return Math.round((assessmentData.overallWritingScore / 5) * 100);
  };

  const getOverallScore = () => {
    const aptitudePercentage = getAptitudeScorePercentage();
    const writingPercentage = getWritingScorePercentage();
    
    if (!assessmentData.overallWritingScore) {
      return aptitudePercentage;
    }
    
    return Math.round((aptitudePercentage + writingPercentage) / 2);
  };

  const getProgressColor = (value: number) => {
    if (value >= 70) return "#22c55e"; // green
    if (value >= 50) return "#eab308"; // yellow
    return "#ef4444"; // red
  };

  const handlePrintPdf = async () => {
    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your PDF...",
    });
    
    const success = await exportToPdf("assessment-content", `${assessmentData.candidateName}-Assessment`);
    
    if (success) {
      toast({
        title: "PDF Generated",
        description: "Assessment has been exported to PDF successfully.",
      });
    } else {
      toast({
        title: "PDF Generation Failed",
        description: "There was an error exporting to PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManualEvaluation = async () => {
    if (!assessmentData.completedPrompts || assessmentData.completedPrompts.length === 0) {
      toast({
        title: "No Writing Prompts",
        description: "This assessment does not have any completed writing prompts to evaluate.",
        variant: "destructive",
      });
      return;
    }

    try {
      setEvaluating(true);
      toast({
        title: "AI Evaluation Started",
        description: "The AI is now evaluating the writing responses. This may take a moment.",
      });

      const scores = await evaluateAllWritingPrompts(assessmentData.completedPrompts);
      
      if (scores.length === 0) {
        throw new Error("No scores were returned from evaluation");
      }

      const validScores = scores.filter(score => score.score > 0);
      const overallScore = validScores.length > 0
        ? Number((validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length).toFixed(1))
        : 0;

      const assessmentRef = doc(db, "assessments", assessmentData.id);
      
      await updateDoc(assessmentRef, {
        writingScores: scores,
        overallWritingScore: overallScore
      });

      setGeneratingSummary(true);
      toast({
        title: "Generating Insights",
        description: "AI is now analyzing the assessment to provide additional insights.",
      });
      
      try {
        const [summary, analysis] = await Promise.all([
          generateCandidateSummary({...assessmentData, writingScores: scores, overallWritingScore: overallScore}),
          generateStrengthsAndWeaknesses({...assessmentData, writingScores: scores, overallWritingScore: overallScore})
        ]);
        
        await updateDoc(assessmentRef, {
          aiSummary: summary,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses
        });
        
        console.log("AI insights generated:", { summary, analysis });
      } catch (aiError) {
        console.error("Error generating AI insights:", aiError);
        toast({
          title: "Insight Generation Failed",
          description: "There was an error generating AI insights. The evaluation scores were saved successfully.",
          variant: "destructive",
        });
      } finally {
        setGeneratingSummary(false);
      }

      const updatedDoc = await getDoc(assessmentRef);
      if (updatedDoc.exists()) {
        const updatedData = {
          id: updatedDoc.id,
          ...updatedDoc.data()
        };
        
        setAssessmentData(updatedData);
      }

      toast({
        title: "Evaluation Complete",
        description: `Successfully evaluated ${validScores.length} of ${scores.length} writing prompts.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error during manual evaluation:", error);
      toast({
        title: "Evaluation Failed",
        description: `There was an error evaluating the writing: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setEvaluating(false);
    }
  };
  
  const regenerateInsights = async () => {
    if (!assessmentData.writingScores || assessmentData.writingScores.length === 0) {
      toast({
        title: "No Writing Scores",
        description: "Please evaluate the writing first to generate insights.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setGeneratingSummary(true);
      toast({
        title: "Regenerating Insights",
        description: "AI is analyzing the assessment to provide updated insights.",
      });
      
      const [summary, analysis] = await Promise.all([
        generateCandidateSummary(assessmentData),
        generateStrengthsAndWeaknesses(assessmentData)
      ]);
      
      const assessmentRef = doc(db, "assessments", assessmentData.id);
      await updateDoc(assessmentRef, {
        aiSummary: summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses
      });
      
      setAssessmentData({
        ...assessmentData,
        aiSummary: summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses
      });
      
      toast({
        title: "Insights Updated",
        description: "AI insights have been regenerated successfully.",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Failed to Regenerate Insights",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setGeneratingSummary(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Assessment Details</h1>
        </div>
        <div className="space-x-2">
          <Button 
            onClick={handlePrintPdf} 
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            <Printer className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button 
            onClick={regenerateInsights} 
            disabled={evaluating || generatingSummary || !assessmentData.writingScores} 
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
          >
            <BrainCircuit className="mr-2 h-4 w-4" />
            {generatingSummary ? "Processing..." : "Regenerate Insights"}
          </Button>
          <Button 
            onClick={handleManualEvaluation} 
            disabled={evaluating || generatingSummary} 
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Zap className="mr-2 h-4 w-4" />
            {evaluating ? "Processing..." : "Evaluate Writing"}
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{assessmentData.candidateName}</CardTitle>
              <CardDescription className="flex items-center text-base">
                <Briefcase className="h-4 w-4 mr-1 inline" /> {assessmentData.candidatePosition}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {getOverallScore() >= 80 && (
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center">
                  <Check className="h-3 w-3 mr-1" /> High Potential
                </div>
              )}
              {getOverallScore() < 40 && (
                <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center">
                  <X className="h-3 w-3 mr-1" /> Needs Review
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-3 border p-3 rounded-md">
              <div className="bg-indigo-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Submission Date</p>
                <p className="font-medium">
                  {assessmentData.submittedAt && assessmentData.submittedAt.toDate
                    ? new Date(assessmentData.submittedAt.toDate()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 border p-3 rounded-md">
              <div className="bg-purple-100 p-2 rounded-full">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Word Count</p>
                <p className="font-medium">{assessmentData.wordCount} words</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border p-3 rounded-md">
              <div className="bg-blue-100 p-2 rounded-full">
                <BarChart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Overall Score</p>
                <p className="font-medium">{getOverallScore()}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
          <TabsTrigger value="comparison" className="flex-1 py-3 data-[state=active]:bg-background rounded-none data-[state=active]:shadow">
            Comparison
          </TabsTrigger>
        </TabsList>
        
        <div id="assessment-content">
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-indigo-500" />
                    AI Assessment Summary
                  </CardTitle>
                  <CardDescription>
                    Based on aptitude test performance and writing assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatingSummary ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
                      <p className="text-sm text-gray-500">Generating AI insights...</p>
                    </div>
                  ) : assessmentData.aiSummary ? (
                    <div className="space-y-4">
                      <div className="bg-indigo-50 border border-indigo-100 rounded-md p-4 relative">
                        <Sparkles className="absolute top-4 right-4 h-4 w-4 text-indigo-500 opacity-40" />
                        <p className="text-indigo-900 italic">"{assessmentData.aiSummary}"</p>
                      </div>
                      
                      {assessmentData.strengths && assessmentData.weaknesses && (
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          <div className="border rounded-md p-4">
                            <h3 className="text-sm font-medium flex items-center text-green-700 mb-2">
                              <ThumbsUp className="h-4 w-4 mr-2" /> Key Strengths
                            </h3>
                            <ul className="space-y-2 text-sm">
                              {assessmentData.strengths.map((strength: string, index: number) => (
                                <li key={`strength-${index}`} className="flex items-start">
                                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="border rounded-md p-4">
                            <h3 className="text-sm font-medium flex items-center text-amber-700 mb-2">
                              <ThumbsDown className="h-4 w-4 mr-2" /> Areas for Improvement
                            </h3>
                            <ul className="space-y-2 text-sm">
                              {assessmentData.weaknesses.map((weakness: string, index: number) => (
                                <li key={`weakness-${index}`} className="flex items-start">
                                  <AlertCircle className="h-4 w-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <span>{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : assessmentData.writingScores && assessmentData.writingScores.length > 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">
                        AI summary not generated yet. Click the "Regenerate Insights" button above to create an assessment summary.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-100 rounded-md p-4 text-center">
                      <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                      <p className="text-amber-800 font-medium">Writing needs to be evaluated first</p>
                      <p className="text-amber-700 text-sm mt-1">
                        Use the "Evaluate Writing" button to assess the candidate's writing and generate AI insights.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <FileCheck className="mr-2 h-5 w-5 text-green-500" />
                      Assessment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Aptitude Score</TableCell>
                          <TableCell className="text-right">
                            <span className={`px-2 py-1 rounded ${getAptitudeScorePercentage() >= 70 ? 'bg-green-100 text-green-700' : getAptitudeScorePercentage() >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                              {assessmentData.aptitudeScore}/{assessmentData.aptitudeTotal} ({getAptitudeScorePercentage()}%)
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Writing Score</TableCell>
                          <TableCell className="text-right">
                            {assessmentData.overallWritingScore ? (
                              <span className={`px-2 py-1 rounded ${getWritingScorePercentage() >= 70 ? 'bg-green-100 text-green-700' : getWritingScorePercentage() >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                {assessmentData.overallWritingScore}/5 ({getWritingScorePercentage()}%)
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">Not Evaluated</span>
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Overall Rating</TableCell>
                          <TableCell className="text-right">
                            <span className={`px-2 py-1 rounded ${getOverallScore() >= 70 ? 'bg-green-100 text-green-700' : getOverallScore() >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                              {getOverallScore()}%
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Performance Comparison</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Aptitude ({getAptitudeScorePercentage()}%)</span>
                      </div>
                      <Progress value={getAptitudeScorePercentage()} className="h-2 bg-gray-200" 
                        color={getProgressColor(getAptitudeScorePercentage())}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Writing ({getWritingScorePercentage()}%)</span>
                      </div>
                      <Progress value={getWritingScorePercentage()} className="h-2 bg-gray-200"
                        color={getProgressColor(getWritingScorePercentage())}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Overall ({getOverallScore()}%)</span>
                      </div>
                      <Progress value={getOverallScore()} className="h-2 bg-gray-200"
                        color={getProgressColor(getOverallScore())}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="aptitude" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aptitude Test Results</CardTitle>
                <CardDescription>
                  Performance on multiple-choice questions assessing cognitive abilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">Score</h3>
                        <p className="text-3xl font-bold">{assessmentData.aptitudeScore}/{assessmentData.aptitudeTotal}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Percentage</h3>
                        <p className="text-3xl font-bold">
                          {getAptitudeScorePercentage()}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Performance Rating</h4>
                      <div className={`py-2 px-3 rounded ${
                        getAptitudeScorePercentage() >= 80 ? 'bg-green-50 text-green-700' :
                        getAptitudeScorePercentage() >= 70 ? 'bg-blue-50 text-blue-700' :
                        getAptitudeScorePercentage() >= 60 ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {
                          getAptitudeScorePercentage() >= 80 ? 'Excellent' :
                          getAptitudeScorePercentage() >= 70 ? 'Good' :
                          getAptitudeScorePercentage() >= 60 ? 'Satisfactory' :
                          'Needs Improvement'
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-3">Score Breakdown</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Correct Answers</span>
                          <span className="text-sm font-medium text-green-600">{assessmentData.aptitudeScore}</span>
                        </div>
                        <Progress value={(assessmentData.aptitudeScore / assessmentData.aptitudeTotal) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Incorrect Answers</span>
                          <span className="text-sm font-medium text-red-600">
                            {assessmentData.aptitudeTotal - assessmentData.aptitudeScore}
                          </span>
                        </div>
                        <Progress 
                          value={((assessmentData.aptitudeTotal - assessmentData.aptitudeScore) / assessmentData.aptitudeTotal) * 100} 
                          className="h-2"
                          style={{'--progress-background': '#ef4444'} as React.CSSProperties} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="writing" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle>Writing Assessment</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p className="font-medium mb-1">Scoring Criteria:</p>
                        <ul className="text-xs space-y-1">
                          {Object.entries(scoringCriteria).map(([score, description]) => (
                            <li key={score} className="flex gap-2">
                              <span className="font-semibold">{score}:</span>
                              <span>{description}</span>
                            </li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              
              <CardContent>
                {assessmentData.overallWritingScore ? (
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Overall Score</h3>
                          <p className={`text-3xl font-bold ${getScoreColor(assessmentData.overallWritingScore)}`}>
                            {assessmentData.overallWritingScore}/5
                          </p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Rating</h3>
                          <p className={`text-xl font-bold ${getScoreColor(assessmentData.overallWritingScore)}`}>
                            {getScoreLabel(assessmentData.overallWritingScore)}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-md ${getScoreBgColor(assessmentData.overallWritingScore)} border`}>
                        <h4 className="font-medium mb-2">What this score means:</h4>
                        <p className="text-sm">
                          {Object.entries(scoringCriteria)
                            .find(([score]) => Math.floor(assessmentData.overallWritingScore) === parseInt(score))?.[1] ||
                            "The response quality is between defined scoring levels."}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Score Distribution</h4>
                      <div className="space-y-3">
                        {assessmentData.writingScores && 
                          [...Array(5)].map((_, idx) => {
                            const score = 5 - idx;
                            const count = assessmentData.writingScores.filter(
                              (s: WritingScore) => Math.floor(s.score) === score
                            ).length;
                            const percentage = assessmentData.writingScores.length > 0 
                              ? (count / assessmentData.writingScores.length) * 100 
                              : 0;
                            
                            return (
                              <div key={score}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">{score} - {scoringCriteria[score].split(':')[0]}</span>
                                  <span className="text-sm font-medium">{count}</span>
                                </div>
                                <Progress 
                                  value={percentage} 
                                  className="h-2"
                                  style={{
                                    '--progress-background': 
                                      score === 5 ? '#22c55e' : 
                                      score === 4 ? '#3b82f6' : 
                                      score === 3 ? '#eab308' : 
                                      score === 2 ? '#f97316' : 
                                      '#ef4444'
                                  } as React.CSSProperties} 
                                />
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 bg-amber-50 rounded-lg mb-6">
                    <div className="flex flex-col items-center text-center">
                      <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
                      <h3 className="text-lg font-medium text-amber-800 mb-1">No AI Evaluation Available</h3>
                      <p className="text-amber-700 max-w-md">
                        The AI has not evaluated this assessment's writing yet. Use the "Evaluate Writing" button at the top of the page to start the evaluation process.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-6">
                  <h3 className="text-lg font-medium border-b pb-2">Writing Responses</h3>
                  {assessmentData.completedPrompts.map((prompt: any, index: number) => {
                    const promptScore = assessmentData.writingScores?.find(
                      (score: any) => score.promptId === prompt.id
                    );
                    
                    return (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-start">
                          <h3 className="text-lg font-medium">{prompt.prompt}</h3>
                          
                          {promptScore ? (
                            <div className={`rounded-full px-3 py-1 text-white font-medium ${
                              promptScore.score === 0 
                                ? "bg-gray-400" 
                                : getScoreColor(promptScore.score).replace("text-", "bg-")
                            } bg-opacity-90`}>
                              {promptScore.score === 0 ? "Not Evaluated" : `${promptScore.score}/5`}
                            </div>
                          ) : (
                            <div className="rounded-full px-3 py-1 text-white font-medium bg-gray-400 bg-opacity-90">
                              Not Evaluated
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">
                            {prompt.response}
                          </div>
                          
                          {promptScore && (
                            <div className={`mt-4 p-3 rounded border ${
                              promptScore.score === 0 
                                ? "bg-gray-50 border-gray-200" 
                                : "bg-blue-50 border-blue-100"
                            }`}>
                              <p className={`text-sm font-medium ${
                                promptScore.score === 0 ? "text-gray-700" : "text-blue-700"
                              }`}>
                                AI Feedback:
                              </p>
                              <p className={`text-sm ${
                                promptScore.score === 0 ? "text-gray-600" : "text-blue-600"
                              }`}>
                                {promptScore.feedback}
                              </p>
                            </div>
                          )}
                          
                          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                            <span>Word count: {prompt.wordCount}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comparison" className="space-y-4">
            <CandidateComparison 
              candidateScore={getOverallScore()}
              averageScore={72} // Mock data - would come from a real average in production
              topScore={94} // Mock data - would come from your top performer
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Benchmark Details</CardTitle>
                <CardDescription>
                  How this candidate compares to others for this position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>This Candidate</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead>Top Performer</TableHead>
                      <TableHead>Percentile</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Overall Score</TableCell>
                      <TableCell>{getOverallScore()}%</TableCell>
                      <TableCell>72%</TableCell>
                      <TableCell>94%</TableCell>
                      <TableCell>
                        {Math.round((getOverallScore() / 72) * 50)}th
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Aptitude</TableCell>
                      <TableCell>{getAptitudeScorePercentage()}%</TableCell>
                      <TableCell>68%</TableCell>
                      <TableCell>92%</TableCell>
                      <TableCell>
                        {Math.round((getAptitudeScorePercentage() / 68) * 50)}th
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Writing</TableCell>
                      <TableCell>{getWritingScorePercentage()}%</TableCell>
                      <TableCell>76%</TableCell>
                      <TableCell>96%</TableCell>
                      <TableCell>
                        {Math.round((getWritingScorePercentage() / 76) * 50)}th
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Word Count</TableCell>
                      <TableCell>{assessmentData.wordCount} words</TableCell>
                      <TableCell>450 words</TableCell>
                      <TableCell>750 words</TableCell>
                      <TableCell>
                        {Math.round((assessmentData.wordCount / 450) * 50)}th
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AssessmentDetails;
