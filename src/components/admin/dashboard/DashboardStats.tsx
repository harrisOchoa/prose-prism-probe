
import React from "react";
import { FileText, Users, Brain, BarChart } from "lucide-react";
import StatCard from "./StatCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardStatsProps {
  totalAssessments: number;
  averageAptitudeScore: string | number;
  averageWordCount: number;
  averageWritingScore: string | number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalAssessments,
  averageAptitudeScore,
  averageWordCount,
  averageWritingScore,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`grid gap-4 ${isMobile ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 md:grid-cols-4"} mb-8`}>
      <StatCard
        title="Total Assessments"
        value={totalAssessments}
        description="All-time submissions"
        icon={FileText}
        iconColor="text-blue-500/20"
      />
      <StatCard
        title="Average Aptitude"
        value={`${averageAptitudeScore}%`}
        description="Overall performance"
        icon={Brain}
        iconColor="text-purple-500/20"
      />
      <StatCard
        title="Average Words"
        value={averageWordCount}
        description="Per submission"
        icon={BarChart}
        iconColor="text-amber-500/20"
      />
      <StatCard
        title="Writing Quality"
        value={`${averageWritingScore}/5`}
        description="Average score"
        icon={Users}
        iconColor="text-green-500/20"
      />
    </div>
  );
};

export default DashboardStats;
