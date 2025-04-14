
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import { DetailedAnalysis } from "@/services/geminiService";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={() => handleGenerateAnalysis()}
          disabled={loading}
          className="transition-all"
          variant={detailedAnalysis ? "outline" : "default"}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getAnalysisButtonLabel("writing")}
        </Button>
      </div>

      {!detailedAnalysis && !loading ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/40">
          <BookOpen className="h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Writing Analysis Available</h3>
          <p className="text-sm text-gray-500 max-w-md">
            Generate detailed analysis of the candidate's writing style, vocabulary, and critical thinking.
          </p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-4" />
          <p className="text-gray-600 font-medium">Analyzing writing samples...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="grid md:grid-cols-3 gap-4">
            {["Writing Style", "Vocabulary Level", "Critical Thinking"].map((category, index) => {
              const valueMap: Record<string, string> = {
                "Writing Style": detailedAnalysis?.writingStyle || "",
                "Vocabulary Level": detailedAnalysis?.vocabularyLevel || "",
                "Critical Thinking": detailedAnalysis?.criticalThinking || ""
              };
              
              return (
                <Card key={index} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <h3 className="font-medium text-gray-700 mb-2 text-md">{category}</h3>
                    <p className="text-sm text-gray-600">{valueMap[category]}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border hover:shadow-md transition-shadow bg-green-50/30">
              <CardContent className="p-5">
                <h3 className="font-medium text-green-700 mb-4 flex items-center text-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Key Strengths
                </h3>
                <ul className="space-y-3">
                  {detailedAnalysis?.strengthAreas.map((strength, index) => (
                    <li key={index} className="flex items-start text-sm bg-white p-3 rounded-md shadow-sm border border-green-100">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border hover:shadow-md transition-shadow bg-amber-50/30">
              <CardContent className="p-5">
                <h3 className="font-medium text-amber-700 mb-4 flex items-center text-lg">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {detailedAnalysis?.improvementAreas.map((area, index) => (
                    <li key={index} className="flex items-start text-sm bg-white p-3 rounded-md shadow-sm border border-amber-100">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingAnalysisTab;
