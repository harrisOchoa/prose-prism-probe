
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InterviewQuestion } from "@/services/geminiService";

interface InterviewQuestionsTabProps {
  interviewQuestions: InterviewQuestion[] | null;
  loading: boolean;
  handleGenerateAnalysis: () => void;
  getAnalysisButtonLabel: (analysisType: string) => string;
  getCategoryBadgeColor: (category: string) => string;
}

const InterviewQuestionsTab: React.FC<InterviewQuestionsTabProps> = ({
  interviewQuestions,
  loading,
  handleGenerateAnalysis,
  getAnalysisButtonLabel,
  getCategoryBadgeColor
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={() => handleGenerateAnalysis()}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getAnalysisButtonLabel("questions")}
        </Button>
      </div>

      {!interviewQuestions && !loading ? (
        <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg">
          <FileQuestion className="h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-600">No Interview Questions Available</h3>
          <p className="text-sm text-gray-500 max-w-md mt-1">
            Generate suggested interview questions based on the candidate's assessment results.
          </p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 mb-3" />
          <p className="text-gray-600">Generating interview questions...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              These questions are based on the candidate's assessment results and are designed to explore both strengths and areas for improvement.
            </p>
          </div>
          
          <div className="space-y-4">
            {interviewQuestions?.map((question, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                  <h3 className="font-medium">{index + 1}. {question.question}</h3>
                  <Badge className={getCategoryBadgeColor(question.category)}>
                    {question.category}
                  </Badge>
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Rationale:</span> {question.rationale}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewQuestionsTab;
