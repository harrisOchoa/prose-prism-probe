
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { getAptitudeScoreColor } from "../utils/assessment-table-utils";
import type { AssessmentTableProps } from "../utils/assessment-table-utils";
import EmptyState from "./EmptyState";
import { formatRelativeDate } from "@/utils/dateFormatters";

const MobileView: React.FC<AssessmentTableProps> = ({
  assessments,
  viewAssessmentDetails,
  getScoreColor,
}) => {
  if (assessments.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {assessments.map((assessment) => (
        <Card key={assessment.id} className="overflow-hidden hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium text-base line-clamp-1">{assessment.candidateName}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{assessment.candidatePosition}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => viewAssessmentDetails(assessment)}
                  className="text-hirescribe-primary hover:text-hirescribe-primary hover:bg-hirescribe-primary/10"
                >
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm pt-1">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Aptitude</p>
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-12 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getAptitudeScoreColor(assessment.aptitudeScore, assessment.aptitudeTotal)} rounded-full`}
                        style={{ width: `${Math.round((assessment.aptitudeScore / assessment.aptitudeTotal) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="font-medium">{assessment.aptitudeScore}/{assessment.aptitudeTotal}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Writing</p>
                  <p className={`${assessment.overallWritingScore ? getScoreColor(assessment.overallWritingScore) : 'text-muted-foreground'} font-medium`}>
                    {assessment.overallWritingScore ? `${assessment.overallWritingScore}/5` : 'N/A'}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Words</p>
                  <p className="font-medium">{assessment.wordCount}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-xs font-medium">
                    {assessment.submittedAt && assessment.submittedAt.toDate 
                      ? formatRelativeDate(assessment.submittedAt.toDate()) 
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MobileView;
