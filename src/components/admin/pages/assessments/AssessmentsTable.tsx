
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import EmptyState from "@/components/admin/dashboard/components/EmptyState";
import { AssessmentWithStatus } from "@/hooks/useAdminAssessments";

interface AssessmentsTableProps {
  assessments: AssessmentWithStatus[];
  loading: boolean;
  error: string | null;
  activeTab: string;
  openAssessmentDetails: (assessment: AssessmentWithStatus) => void;
  getBadgeStyle: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getScoreColor: (score: number, total: number) => string;
}

const AssessmentsTable: React.FC<AssessmentsTableProps> = ({
  assessments,
  loading,
  error,
  activeTab,
  openAssessmentDetails,
  getBadgeStyle,
  getStatusIcon,
  getScoreColor
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState 
        title="Error loading assessments" 
        message={error}
        icon={<FileText className="h-12 w-12 text-muted-foreground opacity-70" />}
      />
    );
  }

  if (assessments.length === 0) {
    return (
      <EmptyState 
        title="No assessments found" 
        message={activeTab === 'all' 
          ? "There are no assessments in the system yet." 
          : `No ${activeTab} assessments found.`}
        icon={<FileText className="h-12 w-12 text-muted-foreground opacity-70" />}
      />
    );
  }

  return (
    <div className="rounded-md border dark:border-slate-700 overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50 dark:bg-slate-800">
          <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
            <TableHead className="w-[250px] font-medium">Assessment</TableHead>
            <TableHead className="font-medium">Position</TableHead>
            <TableHead className="font-medium">Submitted</TableHead>
            <TableHead className="text-center font-medium">Status</TableHead>
            <TableHead className="text-center font-medium">Score</TableHead>
            <TableHead className="text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((assessment) => (
            <TableRow key={assessment.id} className="dark:hover:bg-slate-800/50">
              <TableCell className="font-medium">{assessment.candidateName || "Unknown"}</TableCell>
              <TableCell>{assessment.candidatePosition || "Not specified"}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  {assessment.submittedAt?.toDate ? 
                    format(assessment.submittedAt.toDate(), 'MMM d, yyyy') : 
                    "Unknown date"}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className={`${getBadgeStyle(assessment.status)}`}>
                  <div className="flex items-center">
                    {getStatusIcon(assessment.status)}
                    {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                  </div>
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" 
                  className={getScoreColor(
                    assessment.aptitudeScore || 0, 
                    assessment.aptitudeTotal || 30
                  )}>
                  {assessment.aptitudeScore || 0}/{assessment.aptitudeTotal || 30}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => openAssessmentDetails(assessment)}
                  className="hover:bg-accent dark:hover:bg-slate-700"
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AssessmentsTable;
