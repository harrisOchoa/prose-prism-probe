
import React from "react";
import { BarChart } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import AnalyticsHeader from "./analytics/AnalyticsHeader";
import AnalyticsContent from "./analytics/AnalyticsContent";
import AnalyticsLoading from "./analytics/AnalyticsLoading";
import EmptyState from "@/components/admin/dashboard/components/EmptyState";

const AnalyticsPage = () => {
  const { analytics, loading, error } = useAnalytics();
  const [timePeriod, setTimePeriod] = React.useState("30days");

  const renderContent = () => {
    if (loading) {
      return <AnalyticsLoading />;
    }

    if (error) {
      return (
        <EmptyState 
          title="Error loading analytics" 
          message={error}
          icon={<BarChart className="h-12 w-12 text-muted-foreground opacity-70" />}
        />
      );
    }

    return <AnalyticsContent analytics={analytics} />;
  };

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader 
        timePeriod={timePeriod}
        setTimePeriod={setTimePeriod}
      />
      
      {renderContent()}
    </div>
  );
};

export default AnalyticsPage;
