
import React, { memo } from "react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import AssessmentDetails from "./AssessmentDetails";
import DashboardHeader from "./admin/dashboard/DashboardHeader";
import DashboardStats from "./admin/dashboard/DashboardStats";
import AssessmentTable from "./admin/dashboard/AssessmentTable";
import LoadingState from "./admin/dashboard/LoadingState";
import AdminWelcome from "./admin/dashboard/AdminWelcome";

const AdminDashboard = memo(() => {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    currentItems,
    handlePageChange,
    viewAssessmentDetails,
    selectedAssessment,
    showDetails,
    setShowDetails,
    totalAssessments,
    averageAptitudeScore,
    averageWordCount,
    averageWritingScore,
    getScoreColor,
    hasNextPage
  } = useAdminDashboard();

  if (showDetails && selectedAssessment) {
    return <AssessmentDetails assessment={selectedAssessment} onBack={() => setShowDetails(false)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in px-2 md:px-0 max-w-7xl mx-auto">
      <DashboardHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <AdminWelcome />

      <DashboardStats 
        totalAssessments={totalAssessments}
        averageAptitudeScore={averageAptitudeScore}
        averageWordCount={averageWordCount}
        averageWritingScore={averageWritingScore}
      />

      {loading && currentItems.length === 0 ? (
        <LoadingState />
      ) : (
        <AssessmentTable
          assessments={currentItems}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          viewAssessmentDetails={viewAssessmentDetails}
          getScoreColor={getScoreColor}
          loading={loading}
          hasNextPage={hasNextPage}
        />
      )}
    </div>
  );
});

AdminDashboard.displayName = "AdminDashboard";

export default AdminDashboard;
