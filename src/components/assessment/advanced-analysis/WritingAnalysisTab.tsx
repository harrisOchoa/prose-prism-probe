
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen } from "lucide-react";
import { DetailedAnalysis } from "@/services/geminiService";

interface WritingAnalysisTabProps {
  detailedAnalysis: DetailedAnalysis | null;
  loading: boolean;
  handleGenerateAnalysis: () => void;
  getAnalysisButtonLabel: () => string;
}

const WritingAnalysisTab: React.FC<WritingAnalysisTabProps> = ({
  detailedAnalysis,
  loading,
  handleGenerateAnalysis,
  getAnalysisButtonLabel
}) => {
  // Debug log
  console.log("WritingAnalysisTab rendering with:", { 
    hasAnalysis: !!detailedAnalysis, 
    loading, 
    buttonLabel: getAnalysisButtonLabel() 
  });
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={handleGenerateAnalysis}
          disabled={loading}
          className="relative"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getAnalysisButtonLabel()}
        </Button>
      </div>

      {!detailedAnalysis && !loading ? (
        <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg">
          <BookOpen className="h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-600">No Writing Analysis Available</h3>
          <p className="text-sm text-gray-500 max-w-md mt-1">
            Generate detailed analysis of the candidate's writing style, vocabulary level, and critical thinking abilities.
          </p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 mb-3" />
          <p className="text-gray-600">Analyzing writing samples...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Writing Style Section */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-blue-50 p-3 border-b">
              <h3 className="font-semibold">Writing Style</h3>
            </div>
            <div className="p-3">
              <p className="text-gray-700">{detailedAnalysis?.writingStyle}</p>
            </div>
          </div>

          {/* Vocabulary Level Section */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-purple-50 p-3 border-b">
              <h3 className="font-semibold">Vocabulary Level</h3>
            </div>
            <div className="p-3">
              <p className="text-gray-700">{detailedAnalysis?.vocabularyLevel}</p>
            </div>
          </div>

          {/* Critical Thinking Section */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-amber-50 p-3 border-b">
              <h3 className="font-semibold">Critical Thinking</h3>
            </div>
            <div className="p-3">
              <p className="text-gray-700">{detailedAnalysis?.criticalThinking}</p>
            </div>
          </div>

          {/* Strengths Section */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-green-50 p-3 border-b">
              <h3 className="font-semibold">Strengths</h3>
            </div>
            <div className="p-3">
              <ul className="list-disc pl-5 space-y-1">
                {detailedAnalysis?.strengthAreas.map((strength, index) => (
                  <li key={index} className="text-gray-700">{strength}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Areas for Improvement Section */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-red-50 p-3 border-b">
              <h3 className="font-semibold">Areas for Improvement</h3>
            </div>
            <div className="p-3">
              <ul className="list-disc pl-5 space-y-1">
                {detailedAnalysis?.improvementAreas.map((area, index) => (
                  <li key={index} className="text-gray-700">{area}</li>
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
