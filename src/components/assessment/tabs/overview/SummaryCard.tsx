
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, ThumbsUp, ThumbsDown, AlertCircle, Loader2 } from "lucide-react";

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
  
  // Debug log to help identify issues with data display
  React.useEffect(() => {
    console.log("SummaryCard - Current state:", {
      generatingSummary, 
      hasAiSummary: !!assessmentData.aiSummary,
      aiSummaryLength: assessmentData.aiSummary?.length || 0,
      hasStrengths: !!(assessmentData.strengths && assessmentData.strengths.length > 0),
      hasWeaknesses: !!(assessmentData.weaknesses && assessmentData.weaknesses.length > 0),
      hasValidScores: hasValidWritingScores,
      hasErrorScores: hasErrorScores
    });
  }, [assessmentData, generatingSummary, hasValidWritingScores, hasErrorScores]);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-indigo-500" />
          <span className="pdf-hide">Assessment Summary</span>
          <span className="hidden pdf-show">Assessment Summary</span>
        </CardTitle>
        <CardDescription>
          Based on aptitude test performance and writing assessment
        </CardDescription>
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
                      <li key={`strength-${index}`} className="flex items-start">
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
        ) : hasValidWritingScores ? (
          <div className="text-center py-4">
            <p className="text-gray-500">
              Writing has been evaluated. Click the "Regenerate Insights" button above to create an assessment summary.
            </p>
          </div>
        ) : hasErrorScores ? (
          <div className="bg-amber-50 border border-amber-100 rounded-md p-4 text-center">
            <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-amber-800 font-medium">Writing evaluation encountered errors</p>
            <p className="text-amber-700 text-sm mt-1">
              There were issues evaluating some writing responses. Please try the "Evaluate Writing" button again.
            </p>
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
