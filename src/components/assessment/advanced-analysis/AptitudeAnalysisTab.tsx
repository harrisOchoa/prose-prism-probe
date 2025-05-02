
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AptitudeAnalysisProps {
  aptitudeAnalysis: {
    strengthCategories: string[];
    weaknessCategories: string[];
    recommendations: string[];
    performance: string;
  } | null;
  loading: boolean;
  handleGenerateAnalysis: () => void;
  getAnalysisButtonLabel: (type: string) => string;
}

const AptitudeAnalysisTab: React.FC<AptitudeAnalysisProps> = ({
  aptitudeAnalysis,
  loading,
  handleGenerateAnalysis,
  getAnalysisButtonLabel,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
          Aptitude Insights
        </h3>
        <Button
          onClick={handleGenerateAnalysis}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            getAnalysisButtonLabel("aptitude")
          )}
        </Button>
      </div>

      {aptitudeAnalysis ? (
        <div className="space-y-6 animate-fade-in">
          <Card className="p-6 border shadow-sm bg-white">
            <h4 className="font-medium mb-4 text-purple-700 border-b pb-2">Performance Overview</h4>
            <p className="text-gray-700 leading-relaxed">{aptitudeAnalysis.performance}</p>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6 border shadow-sm bg-white">
              <h4 className="font-medium mb-4 text-green-600 border-b pb-2">Strong Categories</h4>
              {aptitudeAnalysis.strengthCategories && aptitudeAnalysis.strengthCategories.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {aptitudeAnalysis.strengthCategories.map((strength, index) => (
                    <li key={index} className="text-gray-700">{strength}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No strong categories identified in this assessment.</p>
              )}
            </Card>

            <Card className="p-6 border shadow-sm bg-white">
              <h4 className="font-medium mb-4 text-amber-600 border-b pb-2">Areas for Improvement</h4>
              <ul className="list-disc list-inside space-y-2">
                {aptitudeAnalysis.weaknessCategories.map((weakness, index) => (
                  <li key={index} className="text-gray-700">{weakness}</li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="p-6 border shadow-sm bg-white">
            <h4 className="font-medium mb-4 text-blue-600 border-b pb-2">Recommendations</h4>
            <ul className="list-disc list-inside space-y-2">
              {aptitudeAnalysis.recommendations.map((recommendation, index) => (
                <li key={index} className="text-gray-700">{recommendation}</li>
              ))}
            </ul>
          </Card>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-gray-600">
            Generate an analysis to see detailed insights about the candidate's aptitude test performance
          </p>
        </div>
      )}
    </div>
  );
};

export default AptitudeAnalysisTab;
