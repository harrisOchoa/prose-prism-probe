
import React from "react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import AssessmentDetails from "./AssessmentDetails";
import DashboardHeader from "./admin/dashboard/DashboardHeader";
import DashboardStats from "./admin/dashboard/DashboardStats";
import AssessmentTable from "./admin/dashboard/AssessmentTable";
import LoadingState from "./admin/dashboard/LoadingState";

const AdminDashboard = () => {
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
    getScoreColor
  } = useAdminDashboard();

  if (showDetails && selectedAssessment) {
    return <AssessmentDetails assessment={selectedAssessment} onBack={() => setShowDetails(false)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in px-2 md:px-0">
      <DashboardHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="w-full">
        <DashboardStats 
          totalAssessments={totalAssessments}
          averageAptitudeScore={averageAptitudeScore}
          averageWordCount={averageWordCount}
          averageWritingScore={averageWritingScore}
        />
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <AssessmentTable
          assessments={currentItems}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          viewAssessmentDetails={viewAssessmentDetails}
          getScoreColor={getScoreColor}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
