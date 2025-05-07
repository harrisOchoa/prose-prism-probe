
import React from "react";
import KpiCards from "./KpiCards";
import AnalyticsTabs from "./AnalyticsTabs";
import { AnalyticsData } from "@/types/analytics";

interface AnalyticsContentProps {
  analytics: AnalyticsData;
}

const AnalyticsContent: React.FC<AnalyticsContentProps> = ({ analytics }) => {
  return (
    <>
      <KpiCards analytics={analytics} />
      <div className="mt-6">
        <AnalyticsTabs analytics={analytics} />
      </div>
    </>
  );
};

export default AnalyticsContent;
