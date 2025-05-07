
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { ChartBarIcon } from "lucide-react";

const mockData = [
  { name: 'Logical Reasoning', aptitude: 78, writing: 65 },
  { name: 'Communication', aptitude: 65, writing: 82 },
  { name: 'Problem Solving', aptitude: 82, writing: 73 },
  { name: 'Critical Thinking', aptitude: 70, writing: 68 },
  { name: 'Technical Knowledge', aptitude: 90, writing: 60 },
];

const chartConfig = {
  aptitude: {
    label: "Aptitude",
    color: "#8B5CF6",
  },
  writing: {
    label: "Writing",
    color: "#22C55E",
  },
};

const PerformanceMetricsCard = () => {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <ChartBarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
          Performance by Category
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 pt-0">
        <div className="h-[400px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockData}
                margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                />
                <Bar dataKey="aptitude" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="writing" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricsCard;
