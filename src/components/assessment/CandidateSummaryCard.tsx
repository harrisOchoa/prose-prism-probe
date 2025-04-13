
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, Clock, FileText, BarChart, Check, X } from "lucide-react";

interface CandidateSummaryCardProps {
  assessmentData: any;
  getOverallScore: () => number;
}

const CandidateSummaryCard: React.FC<CandidateSummaryCardProps> = ({
  assessmentData,
  getOverallScore
}) => {
  const overallScore = getOverallScore();
  
  return (
    <Card className="border shadow-elevation-1 overflow-hidden animate-fade-in">
      <CardHeader className="pb-3 bg-gradient-to-r from-hirescribe-light to-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl gradient-text font-semibold">{assessmentData.candidateName}</CardTitle>
            <CardDescription className="flex items-center text-base text-gray-600">
              <Briefcase className="h-4 w-4 mr-1.5 inline" /> {assessmentData.candidatePosition}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {overallScore >= 80 && (
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center shadow-subtle">
                <Check className="h-3 w-3 mr-1" /> High Potential
              </div>
            )}
            {overallScore < 40 && (
              <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center shadow-subtle">
                <X className="h-3 w-3 mr-1" /> Needs Review
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-3 border p-3 rounded-md bg-white shadow-subtle hover:shadow-elevation-2 transition-all duration-300">
            <div className="bg-indigo-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Submission Date</p>
              <p className="font-medium">
                {assessmentData.submittedAt && assessmentData.submittedAt.toDate
                  ? new Date(assessmentData.submittedAt.toDate()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border p-3 rounded-md bg-white shadow-subtle hover:shadow-elevation-2 transition-all duration-300">
            <div className="bg-purple-100 p-2 rounded-full">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Word Count</p>
              <p className="font-medium">{assessmentData.wordCount} words</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border p-3 rounded-md bg-white shadow-subtle hover:shadow-elevation-2 transition-all duration-300">
            <div className={`${overallScore >= 70 ? 'bg-green-100' : overallScore >= 40 ? 'bg-amber-100' : 'bg-red-100'} p-2 rounded-full`}>
              <BarChart className={`h-5 w-5 ${overallScore >= 70 ? 'text-green-600' : overallScore >= 40 ? 'text-amber-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overall Score</p>
              <p className={`font-medium ${overallScore >= 70 ? 'text-green-600' : overallScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {overallScore}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateSummaryCard;
