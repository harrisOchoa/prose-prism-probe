
import React, { memo } from "react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import DashboardHeader from "./admin/dashboard/DashboardHeader";
import DashboardStats from "./admin/dashboard/DashboardStats";
import AdminWelcome from "./admin/dashboard/AdminWelcome";
import RecentAssessmentsCard from "./admin/dashboard/RecentAssessmentsCard";
import AssessmentTrendsChart from "./admin/dashboard/AssessmentTrendsChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerformanceMetricsCard from "./admin/dashboard/PerformanceMetricsCard";
import TopCandidatesCard from "./admin/dashboard/TopCandidatesCard";

const AdminDashboard = memo(() => {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    totalAssessments,
    averageAptitudeScore,
    averageWordCount,
    averageWritingScore,
    recentAssessments,
    assessments
  } = useAdminDashboard();

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
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="candidates">Top Candidates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentAssessmentsCard 
              assessments={recentAssessments} 
              loading={loading} 
            />
            <AssessmentTrendsChart assessments={assessments} />
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <PerformanceMetricsCard />
        </TabsContent>
        
        <TabsContent value="candidates" className="space-y-4">
          <TopCandidatesCard assessments={assessments} />
        </TabsContent>
      </Tabs>
    </div>
  );
});

AdminDashboard.displayName = "AdminDashboard";

export default AdminDashboard;
