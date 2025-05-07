
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AnalyticsData } from "@/types/analytics";
import { TrendingUp } from "lucide-react";

interface PerformanceTrendsChartProps {
  analytics: AnalyticsData;
}

const PerformanceTrendsChart: React.FC<PerformanceTrendsChartProps> = ({ analytics }) => {
  // Create trend data using assessment trends for performance metrics
  const trendData = analytics.assessmentTrends.map(month => ({
    name: month.name,
    aptitude: 60 + Math.floor(Math.random() * 30), // Simulate aptitude scores between 60-90%
    writing: 55 + Math.floor(Math.random() * 35), // Simulate writing scores between 55-90%
  }));

  const chartConfig = {
    aptitude: {
      label: "Aptitude Scores",
      color: "#8B5CF6" // Purple
    },
    writing: {
      label: "Writing Scores",
      color: "#22C55E" // Green
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
          Performance Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
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
                <Line
                  type="monotone"
                  dataKey="aptitude"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="writing"
                  stroke="#22C55E" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrendsChart;
