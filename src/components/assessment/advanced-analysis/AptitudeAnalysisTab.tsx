
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getRandomAptitudeQuestions } from "@/utils/aptitudeQuestions";

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
        <h3 className="text-lg font-semibold">Aptitude Analysis</h3>
        <Button
          onClick={handleGenerateAnalysis}
          disabled={loading}
          className="bg-hirescribe-primary hover:bg-hirescribe-accent transition-colors"
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
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h4 className="font-medium mb-4">Performance Overview</h4>
            <p className="text-gray-700">{aptitudeAnalysis.performance}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h4 className="font-medium mb-4">Strong Categories</h4>
              <ul className="list-disc list-inside space-y-2">
                {aptitudeAnalysis.strengthCategories.map((strength, index) => (
                  <li key={index} className="text-gray-700">{strength}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h4 className="font-medium mb-4">Areas for Improvement</h4>
              <ul className="list-disc list-inside space-y-2">
                {aptitudeAnalysis.weaknessCategories.map((weakness, index) => (
                  <li key={index} className="text-gray-700">{weakness}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h4 className="font-medium mb-4">Recommendations</h4>
            <ul className="list-disc list-inside space-y-2">
              {aptitudeAnalysis.recommendations.map((recommendation, index) => (
                <li key={index} className="text-gray-700">{recommendation}</li>
              ))}
            </ul>
          </div>
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
