
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const mockData = [
  { month: 'Jan', submissions: 4 },
  { month: 'Feb', submissions: 7 },
  { month: 'Mar', submissions: 9 },
  { month: 'Apr', submissions: 12 },
  { month: 'May', submissions: 8 },
  { month: 'Jun', submissions: 15 },
  { month: 'Jul', submissions: 18 },
  { month: 'Aug', submissions: 22 }
];

const chartConfig = {
  submissions: {
    label: "Submissions",
    color: "#8B5CF6",
  }
};

const AssessmentTrendsChart = () => {
  return (
    <Card className="border shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
          Submission Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-0">
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorSubmission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
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
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent labelClassName="font-medium" />}
                />
                <Area 
                  type="monotone" 
                  dataKey="submissions" 
                  stroke="#8B5CF6" 
                  fillOpacity={1}
                  fill="url(#colorSubmission)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentTrendsChart;
