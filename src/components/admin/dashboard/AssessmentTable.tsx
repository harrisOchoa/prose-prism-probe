
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
  loading = false,
  hasNextPage = false
}) => {
  const isMobile = useIsMobile();

  return (
    <Card className="border shadow-sm">
      <CardHeader className="bg-card border-b pb-3">
        <CardTitle className="text-lg">Assessment Results</CardTitle>
        <CardDescription className={isMobile ? "text-xs" : ""}>
          Complete overview of candidate submissions
        </CardDescription>
      </CardHeader>
      <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
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

        {assessments.length > 0 && (
          <TablePagination 
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            loading={loading}
            hasNextPage={hasNextPage}
          />
        )}
      </CardContent>
    </Card>
  );
});

AssessmentTable.displayName = "AssessmentTable";

export default AssessmentTable;
