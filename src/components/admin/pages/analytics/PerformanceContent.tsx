
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AnalyticsData } from "@/types/analytics";
import { LineChart } from "lucide-react";
import PerformanceTrendsChart from "./PerformanceTrendsChart";
import PerformanceScoreDistribution from "./PerformanceScoreDistribution";

interface PerformanceContentProps {
  analytics: AnalyticsData;
}

const PerformanceContent: React.FC<PerformanceContentProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Performance Analysis</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceTrendsChart analytics={analytics} />
        <PerformanceScoreDistribution analytics={analytics} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Category Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <CategoryPerformanceChart analytics={analytics} />
        </CardContent>
      </Card>
    </div>
  );
};

// Component for the category performance bar chart
const CategoryPerformanceChart = ({ analytics }: { analytics: AnalyticsData }) => {
  // Prepare data for the chart
  const chartData = analytics.categoryPerformance.map(cat => ({
    name: cat.name,
    score: cat.percentage,
    average: Math.max(cat.percentage - Math.floor(Math.random() * 15), 50) // Simulated average for comparison
  }));

  const chartConfig = {
    score: {
      label: "Current Score",
      color: "#8B5CF6" // Purple
    },
    average: {
      label: "Historical Average",
      color: "#22C55E" // Green
    }
  };

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            stroke="#888888" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
          />
          <Legend />
          <Bar dataKey="score" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="average" fill="#22C55E" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default PerformanceContent;
