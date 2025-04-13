
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
          className="relative transition-all"
          variant={detailedAnalysis ? "outline" : "default"}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getAnalysisButtonLabel("writing")}
        </Button>
      </div>

      {!detailedAnalysis && !loading ? (
        <Card className="border border-dashed bg-muted/40 shadow-subtle">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-1">No Writing Analysis Available</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Generate detailed analysis of the candidate's writing style, vocabulary, and critical thinking.
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card className="border-0 shadow-subtle bg-white">
          <CardContent className="flex flex-col items-center justify-center p-10">
            <Loader2 className="h-12 w-12 animate-spin text-hirescribe-primary mb-4" />
            <p className="text-gray-600 font-medium">Analyzing writing samples...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="grid md:grid-cols-3 gap-4">
            {["Writing Style", "Vocabulary Level", "Critical Thinking"].map((category, index) => {
              const valueMap: Record<string, string> = {
                "Writing Style": detailedAnalysis?.writingStyle || "",
                "Vocabulary Level": detailedAnalysis?.vocabularyLevel || "",
                "Critical Thinking": detailedAnalysis?.criticalThinking || ""
              };
              
              return (
                <Card key={index} className="border card-hover">
                  <CardContent className="p-6">
                    <h3 className="font-medium text-gray-700 mb-2 text-md">{category}</h3>
                    <p className="text-sm text-gray-600">{valueMap[category]}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border card-hover bg-green-50/50">
              <CardContent className="p-6">
                <h3 className="font-medium text-green-700 mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Key Strengths
                </h3>
                <ul className="space-y-3">
                  {detailedAnalysis?.strengthAreas.map((strength, index) => (
                    <li key={index} className="flex items-start text-sm bg-white p-3 rounded-md shadow-subtle">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border card-hover bg-amber-50/50">
              <CardContent className="p-6">
                <h3 className="font-medium text-amber-700 mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {detailedAnalysis?.improvementAreas.map((area, index) => (
                    <li key={index} className="flex items-start text-sm bg-white p-3 rounded-md shadow-subtle">
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
