
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { DetailedAnalysis } from "@/services/geminiService";

interface WritingAnalysisTabProps {
  detailedAnalysis: DetailedAnalysis | null;
  loading: boolean;
  handleGenerateAnalysis: () => void;
  getAnalysisButtonLabel: (analysisType: string) => string;
}

const WritingAnalysisTab: React.FC<WritingAnalysisTabProps> = ({
  detailedAnalysis,
  loading,
  handleGenerateAnalysis,
  getAnalysisButtonLabel,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={() => handleGenerateAnalysis()}
          disabled={loading}
          className="relative"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getAnalysisButtonLabel("writing")}
        </Button>
      </div>

      {!detailedAnalysis && !loading ? (
        <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg">
          <BookOpen className="h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-600">No Writing Analysis Available</h3>
          <p className="text-sm text-gray-500 max-w-md mt-1">
            Generate detailed analysis of the candidate's writing style, vocabulary, and critical thinking.
          </p>
        </div>
      ) : loading ? (
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
    </div>
  );
};

export default WritingAnalysisTab;
