
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { getAptitudeScoreColor } from "../utils/assessment-table-utils";
import type { AssessmentTableProps } from "../utils/assessment-table-utils";
import EmptyState from "./EmptyState";
import { formatDateToLocaleString } from "@/utils/dateFormatters";

const DesktopView: React.FC<AssessmentTableProps> = ({
  assessments,
  viewAssessmentDetails,
  getScoreColor,
}) => {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Candidate</TableHead>
            <TableHead className="font-semibold">Position</TableHead>
            <TableHead className="font-semibold">Aptitude</TableHead>
            <TableHead className="font-semibold">Writing</TableHead>
            <TableHead className="font-semibold">Words</TableHead>
            <TableHead className="font-semibold">Submitted</TableHead>
            <TableHead className="font-semibold w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.length > 0 ? (
            assessments.map((assessment) => (
              <TableRow key={assessment.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{assessment.candidateName}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={assessment.candidatePosition}>
                  {assessment.candidatePosition}
                </TableCell>
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
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>{assessment.wordCount}</TableCell>
                <TableCell>
                  {assessment.submittedAt && assessment.submittedAt.toDate 
                    ? formatDateToLocaleString(assessment.submittedAt.toDate())
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => viewAssessmentDetails(assessment)}
                    className="text-hirescribe-primary hover:text-hirescribe-primary hover:bg-hirescribe-primary/10"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7}>
                <EmptyState />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DesktopView;
