
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter } from "lucide-react";
import { getAptitudeScoreColor } from "../utils/assessment-table-utils";
import type { AssessmentTableProps } from "../utils/assessment-table-utils";

const DesktopView: React.FC<AssessmentTableProps> = ({
  assessments,
  viewAssessmentDetails,
  getScoreColor,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Candidate Name</TableHead>
            <TableHead className="font-semibold">Position</TableHead>
            <TableHead className="font-semibold">Aptitude Score</TableHead>
            <TableHead className="font-semibold">Writing Score</TableHead>
            <TableHead className="font-semibold">Word Count</TableHead>
            <TableHead className="font-semibold">Submission Date</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.length > 0 ? (
            assessments.map((assessment) => (
              <TableRow key={assessment.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{assessment.candidateName}</TableCell>
                <TableCell>{assessment.candidatePosition}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-full max-w-[60px] bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getAptitudeScoreColor(assessment.aptitudeScore, assessment.aptitudeTotal)} rounded-full`}
                        style={{ width: `${Math.round((assessment.aptitudeScore / assessment.aptitudeTotal) * 100)}%` }}
                      ></div>
                    </div>
                    <span>{assessment.aptitudeScore}/{assessment.aptitudeTotal}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {assessment.overallWritingScore ? (
                    <span className={getScoreColor(assessment.overallWritingScore)}>
                      {assessment.overallWritingScore}/5
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </TableCell>
                <TableCell>{assessment.wordCount}</TableCell>
                <TableCell>
                  {assessment.submittedAt && assessment.submittedAt.toDate 
                    ? new Date(assessment.submittedAt.toDate()).toLocaleString() 
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => viewAssessmentDetails(assessment)}
                    className="shadow-subtle hover:shadow-elevation-1 transition-all"
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                <div className="flex flex-col items-center justify-center py-8">
                  <Filter className="h-12 w-12 text-muted-foreground mb-2 opacity-25" />
                  <p>No matching assessments found</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DesktopView;
