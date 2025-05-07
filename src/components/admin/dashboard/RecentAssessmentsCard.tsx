
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssessmentData } from "@/types/assessment";
import { useNavigate } from "react-router-dom";
import { ChevronRight, AlertCircle, Clock, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import LoadingState from "./LoadingState";

interface RecentAssessmentsCardProps {
  assessments: AssessmentData[];
  loading: boolean;
}

const getStatusIcon = (status: string) => {
  switch(status) {
    case 'active':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'completed':
      return <FileCheck className="h-4 w-4 text-green-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
  }
};

const getStatusClass = (status: string) => {
  switch(status) {
    case 'active':
      return "bg-blue-50 text-blue-700 border-blue-200";
    case 'completed':
      return "bg-green-50 text-green-700 border-green-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

const RecentAssessmentsCard: React.FC<RecentAssessmentsCardProps> = ({ assessments, loading }) => {
  const navigate = useNavigate();
  const recentItems = assessments.slice(0, 5); // Only show 5 most recent assessments
  
  return (
    <Card className="border shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
          Recent Submissions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 pb-0">
        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-4">
            {recentItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No recent submissions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentItems.map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(assessment.status || 'pending')}
                      <div>
                        <h4 className="text-sm font-medium line-clamp-1">
                          {assessment.candidateName || "Unknown Candidate"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {assessment.candidatePosition || "Position not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusClass(assessment.status || 'pending')}>
                        {assessment.status?.charAt(0).toUpperCase() + assessment.status?.slice(1) || 'Pending'}
                      </Badge>
                      <div className="text-xs text-muted-foreground hidden md:block">
                        {assessment.submittedAt?.toDate ? 
                          format(assessment.submittedAt.toDate(), 'MMM d, yyyy') : 
                          "Unknown date"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-4 px-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between hover:bg-muted/50"
          onClick={() => navigate("/admin/assessments")}
        >
          View all assessments
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentAssessmentsCard;
