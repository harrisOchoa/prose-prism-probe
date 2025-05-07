
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { CandidateData } from "@/hooks/useAdminCandidates";

interface CandidateCardProps {
  candidate: CandidateData;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  const getScoreColor = (score?: number) => {
    if (score === undefined) return "bg-gray-200 text-gray-700";
    if (score >= 4.5) return "bg-green-100 text-green-700";
    if (score >= 3.5) return "bg-blue-100 text-blue-700";
    if (score >= 2.5) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="font-medium text-lg">{candidate.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4 mr-1" />
                {candidate.position}
              </div>
            </div>
            <Badge variant="outline" className={getScoreColor(candidate.averageScore)}>
              {candidate.averageScore !== undefined 
                ? `${candidate.averageScore.toFixed(1)}/5.0`
                : "N/A"}
            </Badge>
          </div>
        </div>
        <div className="bg-muted/30 px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Assessments</span>
              <div className="flex items-center mt-1">
                <FileText className="h-4 w-4 mr-1.5 text-primary" />
                <span className="font-medium">{candidate.submissions}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Last Submission</span>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1.5 text-primary" />
                <span className="font-medium text-sm">{format(candidate.latestSubmission, 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
