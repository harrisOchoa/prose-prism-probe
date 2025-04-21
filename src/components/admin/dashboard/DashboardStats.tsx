
import React from "react";
import { FileText, Users, Brain } from "lucide-react";
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
    <div className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-2 md:grid-cols-4"}`}>
      <StatCard
        title="Total Assessments"
        value={totalAssessments}
        description="Assessment submissions"
        icon={FileText}
        className={isMobile ? "text-sm p-4" : ""}
      />
      <StatCard
        title="Avg Aptitude Score"
        value={`${averageAptitudeScore}%`}
        description="Average performance"
        icon={Users}
        className={isMobile ? "text-sm p-4" : ""}
      />
      <StatCard
        title="Avg Word Count"
        value={averageWordCount}
        description="Words per submission"
        icon={FileText}
        className={isMobile ? "text-sm p-4" : ""}
      />
      <StatCard
        title="Avg Writing Score"
        value={`${averageWritingScore}/5`}
        description="Quality assessment"
        icon={Brain}
        className={isMobile ? "text-sm p-4" : ""}
      />
    </div>
  );
};

export default DashboardStats;

