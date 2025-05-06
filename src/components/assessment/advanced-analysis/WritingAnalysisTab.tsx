
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, AlertTriangle } from "lucide-react";
import { DetailedAnalysis } from "@/services/geminiService";
import { toast } from "@/hooks/use-toast";

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
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  
  // Sync loading state with props
  useEffect(() => {
    setLocalLoading(loading);
    
    // If we were loading but now we're not, log that analysis should be visible
    if (localLoading && !loading) {
      console.log("Writing analysis loading complete, analysis should be visible:", {detailedAnalysis});
    }
  }, [loading, detailedAnalysis, localLoading]);
  
  // Debug log
  console.log("WritingAnalysisTab rendering with:", { 
    hasAnalysis: !!detailedAnalysis, 
    loading: localLoading, 
    buttonLabel: getAnalysisButtonLabel(),
    error
  });
  
  const handleClick = async () => {
    try {
      setError(null);
      setLocalLoading(true);
      
      console.log("Generate Writing Analysis button clicked");
      toast({
        title: "Generating Analysis",
        description: "Please wait while we analyze the writing samples...",
      });
      
      await handleGenerateAnalysis();
    } catch (err: any) {
      console.error("Error generating writing analysis:", err);
      setError(err.message || "Failed to generate analysis");
      toast({
        title: "Analysis Failed",
        description: err.message || "An error occurred while generating the analysis",
        variant: "destructive",
      });
    } finally {
      // Keep local loading state true until parent component updates
      // This prevents flickering UI states
      setTimeout(() => {
        if (localLoading) {
          setLocalLoading(false);
        }
      }, 2000);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={handleClick}
          disabled={localLoading}
          className="relative"
        >
          {localLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getAnalysisButtonLabel()}
        </Button>
      </div>

      {error && (
        <div className="flex flex-col items-center justify-center p-6 text-center border border-red-200 bg-red-50 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-red-400 mb-2" />
          <h3 className="text-lg font-medium text-red-700">Analysis Error</h3>
          <p className="text-sm text-red-600 max-w-md mt-1">
            {error}
          </p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {!detailedAnalysis && !localLoading && !error ? (
        <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg">
          <BookOpen className="h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-600">No Writing Analysis Available</h3>
          <p className="text-sm text-gray-500 max-w-md mt-1">
            Generate detailed analysis of the candidate's writing style, vocabulary level, and critical thinking abilities.
          </p>
        </div>
      ) : localLoading ? (
        <div className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 mb-3" />
          <p className="text-gray-600">Analyzing writing samples...</p>
          <p className="text-xs text-gray-400 mt-2">This may take up to a minute depending on the length of the writing samples</p>
        </div>
      ) : detailedAnalysis ? (
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
      ) : null}
    </div>
  );
};

export default WritingAnalysisTab;
