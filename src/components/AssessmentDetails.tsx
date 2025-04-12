
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { WritingScore, generateCandidateSummary, generateStrengthsAndWeaknesses } from "@/services/geminiService";
import { evaluateAllWritingPrompts } from "@/services/geminiService";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import SkillsRadarChart from "@/components/assessment/SkillsRadarChart";
import CandidateComparison from "@/components/assessment/CandidateComparison";
import AssessmentHeader from "@/components/assessment/AssessmentHeader";
import CandidateSummaryCard from "@/components/assessment/CandidateSummaryCard";
import OverviewTab from "@/components/assessment/tabs/OverviewTab";
import AptitudeTab from "@/components/assessment/tabs/AptitudeTab";
import WritingTab from "@/components/assessment/tabs/WritingTab";

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
      <AssessmentHeader 
        assessmentData={assessmentData}
        onBack={onBack}
        evaluating={evaluating}
        generatingSummary={generatingSummary}
        handleManualEvaluation={handleManualEvaluation}
        regenerateInsights={regenerateInsights}
      />

      <CandidateSummaryCard 
        assessmentData={assessmentData}
        getOverallScore={getOverallScore}
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
          <TabsTrigger value="comparison" className="flex-1 py-3 data-[state=active]:bg-background rounded-none data-[state=active]:shadow">
            Comparison
          </TabsTrigger>
        </TabsList>
        
        <div id="assessment-content">
          <TabsContent value="overview" className="space-y-6">
            <OverviewTab 
              assessmentData={assessmentData}
              generatingSummary={generatingSummary}
              getAptitudeScorePercentage={getAptitudeScorePercentage}
              getWritingScorePercentage={getWritingScorePercentage}
              getOverallScore={getOverallScore}
              getProgressColor={getProgressColor}
            />
          </TabsContent>
          
          <TabsContent value="aptitude" className="space-y-4">
            <AptitudeTab 
              assessmentData={assessmentData}
              getAptitudeScorePercentage={getAptitudeScorePercentage}
            />
          </TabsContent>
          
          <TabsContent value="writing" className="space-y-4">
            <WritingTab 
              assessmentData={assessmentData}
              getScoreColor={getScoreColor}
              getScoreBgColor={getScoreBgColor}
              getScoreLabel={getScoreLabel}
            />
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
