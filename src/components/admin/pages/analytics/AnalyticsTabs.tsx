
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, LineChart, PieChart } from "lucide-react";
import { AnalyticsData } from "@/types/analytics";
import AssessmentTrends from "./AssessmentTrends";
import TopPerformingCategories from "./TopPerformingCategories";
import RecentActivity from "./RecentActivity";
import EmptyTabContent from "./EmptyTabContent";
import PerformanceContent from "./PerformanceContent";

interface AnalyticsTabsProps {
  analytics: AnalyticsData;
}

const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({ analytics }) => {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">
          <BarChart3 className="h-4 w-4 mr-1" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="performance">
          <LineChart className="h-4 w-4 mr-1" />
          Performance
        </TabsTrigger>
        <TabsTrigger value="demographics">
          <PieChart className="h-4 w-4 mr-1" />
          Demographics
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-4 space-y-4">
        <AssessmentTrends data={analytics.assessmentTrends} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TopPerformingCategories categories={analytics.categoryPerformance} />
          <RecentActivity activities={analytics.recentActivity} />
        </div>
      </TabsContent>
      
      <TabsContent value="performance" className="mt-4 overflow-visible">
        <PerformanceContent analytics={analytics} />
      </TabsContent>
      
      <TabsContent value="demographics" className="mt-4">
        <EmptyTabContent 
          title="Demographic Analytics" 
          message="Candidate demographic data will be available in a future update."
          icon={<PieChart className="h-12 w-12 text-muted-foreground opacity-70" />}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AnalyticsTabs;
