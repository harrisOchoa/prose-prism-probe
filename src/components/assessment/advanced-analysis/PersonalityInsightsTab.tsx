
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PersonalityInsight } from "@/services/geminiService";

interface PersonalityInsightsTabProps {
  personalityInsights: PersonalityInsight[] | null;
  loading: boolean;
  handleGenerateAnalysis: () => void;
  getAnalysisButtonLabel: (analysisType: string) => string;
  getConfidenceBadgeColor: (confidence: number) => string;
  getProgressColor: (value: number) => string;
}

const PersonalityInsightsTab: React.FC<PersonalityInsightsTabProps> = ({
  personalityInsights,
  loading,
  handleGenerateAnalysis,
  getAnalysisButtonLabel,
  getConfidenceBadgeColor,
  getProgressColor
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={() => handleGenerateAnalysis()}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getAnalysisButtonLabel("personality")}
        </Button>
      </div>

      {!personalityInsights && !loading ? (
        <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg">
          <Brain className="h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-600">No Personality Insights Available</h3>
          <p className="text-sm text-gray-500 max-w-md mt-1">
            Generate insights about the candidate's personality traits based on their writing style.
          </p>
        </div>
      ) : loading ? (
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
    </div>
  );
};

export default PersonalityInsightsTab;
