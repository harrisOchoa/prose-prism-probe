
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnalyticsData } from "@/types/analytics";

interface KpiCardsProps {
  analytics: AnalyticsData;
}

const KpiCards: React.FC<KpiCardsProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Assessment Completion Rate</CardTitle>
          <CardDescription>{analytics.completionRate}% overall completion</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold">{analytics.completionRate}%</div>
          <div className="h-2 w-full bg-gray-100 rounded-full mt-2 mb-1">
            <div className="h-2 bg-hirescribe-primary rounded-full" style={{ width: `${analytics.completionRate}%` }}></div>
          </div>
          <p className="text-xs text-muted-foreground">+12% from previous period</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Average Completion Time</CardTitle>
          <CardDescription>Time to complete assessments</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold">{analytics.averageCompletionTime}</div>
          <p className="text-xs text-muted-foreground mt-4">-2m 14s from previous period</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Total Assessments</CardTitle>
          <CardDescription>All time</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold">{analytics.totalAssessments}</div>
          <div className="flex items-center mt-4">
            <div className={`flex h-1.5 w-1.5 rounded-full ${analytics.monthlyGrowth >= 0 ? 'bg-green-500' : 'bg-red-500'} mr-1`}></div>
            <p className={`text-xs ${analytics.monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {analytics.monthlyGrowth >= 0 ? '+' : ''}{analytics.monthlyGrowth}% this month
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KpiCards;
