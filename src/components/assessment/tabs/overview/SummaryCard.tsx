
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, ThumbsUp, ThumbsDown, AlertCircle, Loader2, Brain } from "lucide-react";
import { AnalysisStatus } from "@/firebase/services/assessment/types";

interface SummaryCardProps {
  assessmentData: any;
  generatingSummary: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ assessmentData, generatingSummary }) => {
  // Check if we have valid writing scores
  const hasValidWritingScores = assessmentData.writingScores && 
    assessmentData.writingScores.length > 0 &&
    assessmentData.writingScores.some((score: any) => score.score > 0);
    
  // Check if we have error scores (score of 0)
  const hasErrorScores = assessmentData.writingScores && 
    assessmentData.writingScores.length > 0 &&
    assessmentData.writingScores.some((score: any) => score.score === 0);
  
  // State to force re-renders
  const [renderKey, setRenderKey] = useState(Date.now());
  
  // Get analysis status
  const analysisStatus: AnalysisStatus = assessmentData.analysisStatus || 
    (hasValidWritingScores ? 'writing_evaluated' : 'pending');
  
  const isAnalysisInProgress = analysisStatus === 'pending' || 
    analysisStatus === 'writing_evaluated' || 
    analysisStatus === 'advanced_analysis_started';
  
  // Debug log to help identify issues with data display
  useEffect(() => {
    console.log("SummaryCard - Current state:", {
      generatingSummary, 
      hasAiSummary: !!assessmentData.aiSummary,
      aiSummaryLength: assessmentData.aiSummary?.length || 0,
      hasStrengths: !!(assessmentData.strengths && assessmentData.strengths.length > 0),
      hasWeaknesses: !!(assessmentData.weaknesses && assessmentData.weaknesses.length > 0),
      hasValidScores: hasValidWritingScores,
      hasErrorScores: hasErrorScores,
      assessmentId: assessmentData.id,
      analysisStatus
    });
    
    // Force component to re-render when assessmentData changes
    setRenderKey(Date.now());
  }, [assessmentData, generatingSummary, hasValidWritingScores, hasErrorScores, analysisStatus]);
  
  // Render analysis status badge
  const renderAnalysisStatusBadge = () => {
    if (generatingSummary || isAnalysisInProgress) {
      return (
        <div className="absolute top-4 right-4 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          Analyzing...
        </div>
      );
    } else if (analysisStatus === 'failed') {
      return (
        <div className="absolute top-4 right-4 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Analysis Failed
        </div>
      );
    } else if (analysisStatus === 'completed') {
      return (
        <div className="absolute top-4 right-4 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          <Brain className="h-3 w-3 mr-1" />
          Analysis Complete
        </div>
      );
    } else if (assessmentData.aiSummary) {
      return (
        <div className="absolute top-4 right-4 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          <Sparkles className="h-3 w-3 mr-1" />
          Insights Generated
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card key={renderKey} className="relative">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-indigo-500" />
          <span className="pdf-hide">Assessment Summary</span>
          <span className="hidden pdf-show">Assessment Summary</span>
        </CardTitle>
        <CardDescription>
          Based on aptitude test performance and writing assessment
        </CardDescription>
        {renderAnalysisStatusBadge()}
      </CardHeader>
      <CardContent>
        {generatingSummary ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm text-gray-500">Generating insights...</p>
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
                      <li key={`strength-${index}-${renderKey}`} className="flex items-start">
                        <ThumbsUp className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
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
                      <li key={`weakness-${index}-${renderKey}`} className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : hasValidWritingScores ? (
          <div className="text-center py-4">
            <p className="text-gray-500">
              Writing has been evaluated. Click the "Regenerate Insights" button above to create an assessment summary.
            </p>
          </div>
        ) : hasErrorScores || analysisStatus === 'failed' ? (
          <div className="bg-amber-50 border border-amber-100 rounded-md p-4 text-center">
            <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-amber-800 font-medium">Writing evaluation encountered errors</p>
            <p className="text-amber-700 text-sm mt-1">
              There were issues evaluating some writing responses. Please try the "Evaluate Writing" button again.
            </p>
          </div>
        ) : isAnalysisInProgress ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
            <p className="text-sm text-gray-500">Automatic analysis in progress...</p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-md p-4 text-center">
            <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-amber-800 font-medium">Writing needs to be evaluated first</p>
            <p className="text-amber-700 text-sm mt-1">
              Use the "Evaluate Writing" button to assess the candidate's writing and generate insights.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
