
import React from "react";
import { FileText, Users, Brain } from "lucide-react";
import StatCard from "./StatCard";

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
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard
        title="Total Assessments"
        value={totalAssessments}
        description="Assessment submissions"
        icon={FileText}
      />
      <StatCard
        title="Avg Aptitude Score"
        value={`${averageAptitudeScore}%`}
        description="Average performance"
        icon={Users}
      />
      <StatCard
        title="Avg Word Count"
        value={averageWordCount}
        description="Words per submission"
        icon={FileText}
      />
      <StatCard
        title="Avg Writing Score"
        value={`${averageWritingScore}/5`}
        description="Quality assessment"
        icon={Brain}
      />
    </div>
  );
};

export default DashboardStats;
