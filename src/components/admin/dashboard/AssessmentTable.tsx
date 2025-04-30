
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileView from "./components/MobileView";
import DesktopView from "./components/DesktopView";
import TablePagination from "./components/TablePagination";
import type { AssessmentTableProps } from "./utils/assessment-table-utils";

const AssessmentTable: React.FC<AssessmentTableProps> = memo(({
  assessments,
  currentPage,
  totalPages,
  handlePageChange,
  viewAssessmentDetails,
  getScoreColor,
}) => {
  const isMobile = useIsMobile();

  return (
    <Card className="shadow-subtle hover:shadow-elevation-1 transition-all">
      <CardHeader>
        <CardTitle>{isMobile ? "Assessments" : "Assessment Results"}</CardTitle>
        <CardDescription className={isMobile ? "text-xs" : ""}>
          {isMobile ? "All submissions" : "Comprehensive view of all candidate assessments"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <MobileView
            assessments={assessments}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            viewAssessmentDetails={viewAssessmentDetails}
            getScoreColor={getScoreColor}
          />
        ) : (
          <DesktopView
            assessments={assessments}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            viewAssessmentDetails={viewAssessmentDetails}
            getScoreColor={getScoreColor}
          />
        )}

        <TablePagination 
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      </CardContent>
    </Card>
  );
});

AssessmentTable.displayName = "AssessmentTable";

export default AssessmentTable;
