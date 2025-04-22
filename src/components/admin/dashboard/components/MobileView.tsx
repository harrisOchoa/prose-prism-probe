
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Filter } from "lucide-react";
import { getAptitudeScoreColor } from "../utils/assessment-table-utils";
import type { AssessmentTableProps } from "../utils/assessment-table-utils";

const MobileView: React.FC<AssessmentTableProps> = ({
  assessments,
  viewAssessmentDetails,
  getScoreColor,
}) => {
  if (assessments.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <Filter className="h-12 w-12 text-muted-foreground mb-2 opacity-25" />
          <p>No matching assessments found</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assessments.map((assessment) => (
        <Card key={assessment.id} className="shadow-subtle hover:shadow-elevation-1 transition-all">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-base">{assessment.candidateName}</h3>
                  <p className="text-sm text-gray-500">{assessment.candidatePosition}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => viewAssessmentDetails(assessment)}
                  className="shadow-subtle hover:shadow-elevation-1 transition-all"
                >
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Aptitude</p>
                  <div className="flex items-center mt-1">
                    <div className="mr-2 h-2 w-12 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getAptitudeScoreColor(assessment.aptitudeScore, assessment.aptitudeTotal)} rounded-full`}
                        style={{ width: `${Math.round((assessment.aptitudeScore / assessment.aptitudeTotal) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{assessment.aptitudeScore}/{assessment.aptitudeTotal}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-500">Writing</p>
                  <p className={`${assessment.overallWritingScore ? getScoreColor(assessment.overallWritingScore) : 'text-gray-400'} font-medium`}>
                    {assessment.overallWritingScore ? `${assessment.overallWritingScore}/5` : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-500">Words</p>
                  <p className="font-medium">{assessment.wordCount}</p>
                </div>
                
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="text-xs">
                    {assessment.submittedAt && assessment.submittedAt.toDate 
                      ? new Date(assessment.submittedAt.toDate()).toLocaleDateString() 
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
