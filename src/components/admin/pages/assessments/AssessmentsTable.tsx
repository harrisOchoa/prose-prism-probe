import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, FileText, Clock, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Calculate overall score from available assessment data
const calculateOverallScore = (assessment: any): number => {
  // Debug log to see actual data structure
  if (process.env.NODE_ENV === 'development') {
    console.log('Assessment data for score calculation:', {
      id: assessment.id,
      candidateName: assessment.candidateName,
      overallWritingScore: assessment.overallWritingScore,
      writingScores: assessment.writingScores,
      aptitudeScore: assessment.aptitudeScore,
      aptitudeTotal: assessment.aptitudeTotal,
      overallScore: assessment.overallScore,
      aptitudeData: assessment.aptitudeData,
      allKeys: Object.keys(assessment)
    });
  }

  // Priority 1: Check for aptitude score (most common for these assessments)
  if (assessment.aptitudeScore !== undefined && assessment.aptitudeTotal && assessment.aptitudeTotal > 0) {
    const percentage = (assessment.aptitudeScore / assessment.aptitudeTotal) * 100;
    return Math.round(percentage);
  }

  // Priority 2: Check aptitudeData.correctAnswers if aptitudeScore isn't available
  if (assessment.aptitudeData?.correctAnswers !== undefined && assessment.aptitudeTotal && assessment.aptitudeTotal > 0) {
    const percentage = (assessment.aptitudeData.correctAnswers / assessment.aptitudeTotal) * 100;
    return Math.round(percentage);
  }

  // Priority 3: Check for overall writing score
  if (assessment.overallWritingScore && assessment.overallWritingScore > 0) {
    return Math.round(assessment.overallWritingScore);
  }
  
  // Priority 4: Calculate from writing scores array
  if (assessment.writingScores && assessment.writingScores.length > 0) {
    const validScores = assessment.writingScores.filter((score: any) => score.score > 0);
    if (validScores.length > 0) {
      const average = validScores.reduce((sum: number, score: any) => sum + score.score, 0) / validScores.length;
      return Math.round(average);
    }
  }
  
  // Priority 5: Fallback to any overallScore property
  if (assessment.overallScore && assessment.overallScore > 0) {
    return Math.round(assessment.overallScore);
  }
  
  return 0;
};

interface AssessmentsTableProps {
  assessments: any[];
  loading: boolean;
  error: string | null;
  activeTab: string;
  openAssessmentDetails: (assessment: any) => void;
  getBadgeStyle: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getScoreColor: (score: number) => string;
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
  // All hooks must be at the top level
  const handleViewAssessment = useCallback((assessment: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("View button clicked for assessment:", {
        assessmentId: assessment?.id,
        candidateName: assessment?.candidateName
      });
    }
    
    if (!assessment) {
      console.error("Cannot view assessment - assessment object is null/undefined");
      return;
    }
    
    openAssessmentDetails(assessment);
  }, [openAssessmentDetails]);

  // Development logging
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("AssessmentsTable received:", {
        assessmentsCount: assessments.length,
        activeTab
      });
    }
  }, [assessments.length, activeTab]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600">No assessments found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((assessment) => (
            <TableRow key={assessment.id}>
              <TableCell className="font-medium">
                {assessment.candidateName || 'Unknown'}
              </TableCell>
              <TableCell>
                {assessment.candidatePosition || 'Not specified'}
              </TableCell>
              <TableCell>
                <Badge className={getBadgeStyle(assessment.status || 'pending')}>
                  {assessment.status || 'pending'}
                </Badge>
              </TableCell>
              <TableCell>
                <span className={getScoreColor(calculateOverallScore(assessment))}>
                  {calculateOverallScore(assessment)}%
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4 text-gray-400" />
                  {assessment.submittedAt ? 
                    new Date(assessment.submittedAt.toDate()).toLocaleDateString() :
                    'Unknown'
                  }
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewAssessment(assessment)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
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