
import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { 
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { WritingScore } from "@/services/geminiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

interface SkillsRadarChartProps {
  writingScores: WritingScore[];
  aptitudeScore: number;
  aptitudeTotal: number;
}

const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({ 
  writingScores, 
  aptitudeScore,
  aptitudeTotal
}) => {
  const validScores = writingScores?.filter(score => score.score > 0) || [];
  
  // Group writing scores by criteria
  const categorizedScores: Record<string, number[]> = {};
  validScores.forEach(score => {
    // Use the promptId as a fallback category if no category exists
    const category = score.promptId || "General Writing";
    if (!categorizedScores[category]) {
      categorizedScores[category] = [];
    }
    categorizedScores[category].push(score.score);
  });
  
  // Average scores by category
  const chartData = Object.entries(categorizedScores).map(([category, scores]) => {
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    // Truncate category names that are too long
    return {
      category: category.length > 10 ? category.substring(0, 10) + "..." : category,
      fullName: category,
      score: Number(avgScore.toFixed(1)),
      fullMark: 5
    };
  });
  
  // Add aptitude score
  chartData.push({
    category: "Aptitude",
    fullName: "Aptitude Test Score",
    score: Number(((aptitudeScore / aptitudeTotal) * 5).toFixed(1)),
    fullMark: 5
  });
  
  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "#22c55e"; // green
    if (score >= 3.5) return "#3b82f6"; // blue
    if (score >= 2.5) return "#eab308"; // yellow
    if (score >= 1.5) return "#f97316"; // orange
    return "#ef4444"; // red
  };
  
  return (
    <Card className="border shadow-elevation-1 animate-fade-in overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-lg font-medium">Skills Assessment</CardTitle>
        <Zap className="h-5 w-5 text-hirescribe-primary" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          {/* Radar chart in fixed size container */}
          <div className="w-full h-[260px] mb-6">
            <ChartContainer 
              config={{
                skills: { theme: { light: '#4F46E5', dark: '#818CF8' } }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart 
                  cx="50%" 
                  cy="50%" 
                  outerRadius="45%" 
                  data={chartData}
                >
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ 
                      fill: '#6b7280', 
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 5]} 
                    stroke="#9ca3af"
                    tick={{ 
                      fill: '#6b7280', 
                      fontSize: 10 
                    }}
                    tickCount={6}
                    axisLine={false}
                  />
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 rounded-md shadow-lg border text-sm">
                            <p className="font-medium">{data.fullName || data.category}</p>
                            <p className="text-hirescribe-primary">Score: {data.score}/5</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Radar 
                    name="Skills" 
                    dataKey="score" 
                    stroke="#4F46E5" 
                    fill="#4F46E5" 
                    fillOpacity={0.6} 
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          
          {/* Score cards in a grid layout with clear spacing below chart */}
          <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {chartData.map((item, index) => (
              <div 
                key={index} 
                className="text-center p-3 rounded-md border transition-all duration-300 hover:shadow-md bg-indigo-50/80"
              >
                <div className="text-xs font-medium text-gray-600 truncate mb-1">
                  {item.fullName || item.category}
                </div>
                <div 
                  className="text-lg font-semibold" 
                  style={{ color: getScoreColor(item.score) }}
                >
                  {item.score}/5
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsRadarChart;
