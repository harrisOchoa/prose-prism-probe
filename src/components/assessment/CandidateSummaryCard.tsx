
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
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">{assessmentData.candidateName}</CardTitle>
            <CardDescription className="flex items-center text-base">
              <Briefcase className="h-4 w-4 mr-1 inline" /> {assessmentData.candidatePosition}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {getOverallScore() >= 80 && (
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center">
                <Check className="h-3 w-3 mr-1" /> High Potential
              </div>
            )}
            {getOverallScore() < 40 && (
              <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center">
                <X className="h-3 w-3 mr-1" /> Needs Review
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-3 border p-3 rounded-md">
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
          <div className="flex items-center gap-3 border p-3 rounded-md">
            <div className="bg-purple-100 p-2 rounded-full">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Word Count</p>
              <p className="font-medium">{assessmentData.wordCount} words</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border p-3 rounded-md">
            <div className="bg-blue-100 p-2 rounded-full">
              <BarChart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overall Score</p>
              <p className="font-medium">{getOverallScore()}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateSummaryCard;
