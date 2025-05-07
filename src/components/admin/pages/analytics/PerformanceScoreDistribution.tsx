
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AnalyticsData } from "@/types/analytics";
import { ChartPie } from "lucide-react";

interface PerformanceScoreDistributionProps {
  analytics: AnalyticsData;
}

const PerformanceScoreDistribution: React.FC<PerformanceScoreDistributionProps> = ({ analytics }) => {
  // Generate distribution data based on assessment count
  const totalAssessments = analytics.totalAssessments || 10;
  
  const distributionData = [
    { name: "Excellent (80-100%)", value: Math.floor(totalAssessments * 0.25) },
    { name: "Good (70-79%)", value: Math.floor(totalAssessments * 0.35) },
    { name: "Average (60-69%)", value: Math.floor(totalAssessments * 0.25) },
    { name: "Below Average (< 60%)", value: Math.max(1, totalAssessments - Math.floor(totalAssessments * 0.85)) }
  ];

  const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444'];

  const chartConfig = {
    excellent: {
      label: "Excellent",
      color: "#22C55E"
    },
    good: {
      label: "Good",
      color: "#3B82F6"
    },
    average: {
      label: "Average",
      color: "#F59E0B"
    },
    belowAverage: {
      label: "Below Average",
      color: "#EF4444"
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <ChartPie className="mr-2 h-5 w-5 text-muted-foreground" />
          Score Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceScoreDistribution;
