
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import { AnalyticsData } from "@/types/analytics";

interface AssessmentTrendsProps {
  data: AnalyticsData["assessmentTrends"];
}

const AssessmentTrends: React.FC<AssessmentTrendsProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Assessment Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="assessments" fill="#9b87f5" name="Assessments" />
            <Bar dataKey="completions" fill="#6E59A5" name="Completions" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AssessmentTrends;
