
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import { useAdminAssessments } from "@/hooks/useAdminAssessments";
import AssessmentDetailsDialog from "./assessments/AssessmentDetailsDialog";
import AssessmentsHeader from "./assessments/AssessmentsHeader";
import AssessmentsSearch from "./assessments/AssessmentsSearch";
import AssessmentsTable from "./assessments/AssessmentsTable";
import { useAssessmentUtils } from "./assessments/useAssessmentUtils";

const AssessmentsPage = () => {
  const { 
    assessments, 
    loading, 
    error, 
    searchTerm, 
    setSearchTerm, 
    activeTab, 
    setActiveTab,
    counts 
  } = useAdminAssessments();
  
  const {
    selectedAssessment,
    isDialogOpen,
    openAssessmentDetails,
    closeAssessmentDetails,
    getBadgeStyle,
    getStatusIcon,
    getScoreColor
  } = useAssessmentUtils();

  // Optimized assessment state logging with useMemo
  const assessmentState = useMemo(() => ({
    hasSelectedAssessment: !!selectedAssessment,
    selectedAssessmentId: selectedAssessment?.id,
    isDialogOpen,
    assessmentsCount: assessments.length
  }), [selectedAssessment, isDialogOpen, assessments.length]);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("AssessmentsPage - selectedAssessment:", assessmentState);
    }
  }, [assessmentState]);

  // Add error boundary for debugging
  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error loading assessments: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AssessmentsHeader 
        totalCount={counts?.total || 0} 
        loading={loading} 
      />
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <AssessmentsSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeTab={activeTab}
          counts={counts}
          getBadgeStyle={getBadgeStyle}
        />
        
        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Assessment Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AssessmentsTable
                assessments={assessments}
                loading={loading}
                error={error}
                activeTab={activeTab}
                openAssessmentDetails={openAssessmentDetails}
                getBadgeStyle={getBadgeStyle}
                getStatusIcon={getStatusIcon}
                getScoreColor={getScoreColor}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Make sure we're properly passing the selected assessment */}
      {selectedAssessment && (
        <AssessmentDetailsDialog
          assessment={selectedAssessment}
          isOpen={isDialogOpen}
          onClose={closeAssessmentDetails}
        />
      )}
    </div>
  );
};

export default AssessmentsPage;
