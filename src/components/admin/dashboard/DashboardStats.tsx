
import React from "react";
import { FileText, Users, Brain, BarChart } from "lucide-react";
import StatCard from "./StatCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardStatsProps {
  totalAssessments: number;
  averageAptitudeScore: string | number;
  averageWordCount: number;
  averageWritingScore: string | number;
  // Added mock trend data for visual enhancement
  trends?: {
    totalAssessments?: { type: "up" | "down" | "neutral", value: string };
    averageAptitude?: { type: "up" | "down" | "neutral", value: string };
    averageWords?: { type: "up" | "down" | "neutral", value: string };
    averageWriting?: { type: "up" | "down" | "neutral", value: string };
  }
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalAssessments,
  averageAptitudeScore,
  averageWordCount,
  averageWritingScore,
  trends = {
    totalAssessments: { type: "up", value: "+12% ↑" },
    averageAptitude: { type: "neutral", value: "0% ↔" },
    averageWords: { type: "down", value: "-5% ↓" },
    averageWriting: { type: "up", value: "+8% ↑" }
  }
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`grid gap-4 ${isMobile ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 md:grid-cols-4"} mb-8`}>
      <StatCard
        title="Total Assessments"
        value={totalAssessments}
        description="All-time submissions"
        icon={FileText}
        iconColor="bg-blue-500/20 text-blue-500"
        trend={trends?.totalAssessments?.type}
        trendValue={trends?.totalAssessments?.value}
        className="hover:border-blue-300/50 transition-all duration-200"
      />
      <StatCard
        title="Average Aptitude"
        value={`${averageAptitudeScore}%`}
        description="Overall performance"
        icon={Brain}
        iconColor="bg-purple-500/20 text-purple-500"
        trend={trends?.averageAptitude?.type}
        trendValue={trends?.averageAptitude?.value}
        className="hover:border-purple-300/50 transition-all duration-200"
      />
      <StatCard
        title="Average Words"
        value={averageWordCount}
        description="Per submission"
        icon={BarChart}
        iconColor="bg-amber-500/20 text-amber-500"
        trend={trends?.averageWords?.type}
        trendValue={trends?.averageWords?.value}
        className="hover:border-amber-300/50 transition-all duration-200"
      />
      <StatCard
        title="Writing Quality"
        value={`${averageWritingScore}/5`}
        description="Average score"
        icon={Users}
        iconColor="bg-green-500/20 text-green-500"
        trend={trends?.averageWriting?.type}
        trendValue={trends?.averageWriting?.value}
        className="hover:border-green-300/50 transition-all duration-200"
      />
    </div>
  );
};

export default DashboardStats;
