
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
  ChartTooltipContent
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
    return {
      category,
      score: Number(avgScore.toFixed(1)),
      fullMark: 5
    };
  });
  
  // Add aptitude score
  chartData.push({
    category: "Aptitude",
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
    <Card className="border shadow-elevation-1 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-lg font-medium">Skills Assessment</CardTitle>
        <Zap className="h-5 w-5 text-hirescribe-primary" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="w-full h-[300px]">
          <ChartContainer 
            config={{
              skills: { theme: { light: '#4F46E5', dark: '#818CF8' } }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                cx="50%" 
                cy="50%" 
                outerRadius="70%" 
                data={chartData}
              >
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={{ 
                    fill: '#6b7280', 
                    fontSize: 12,
                    fontWeight: 500
                  }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 5]} 
                  stroke="#9ca3af"
                  tick={{ 
                    fill: '#6b7280', 
                    fontSize: 10 
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
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
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
          {chartData.map((item, index) => (
            <div 
              key={index} 
              className="text-center p-2 rounded-md"
              style={{ backgroundColor: `rgba(79, 70, 229, ${item.score/10})` }}
            >
              <div className="text-xs font-medium text-gray-600 truncate">{item.category}</div>
              <div 
                className="text-lg font-semibold" 
                style={{ color: getScoreColor(item.score) }}
              >
                {item.score}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsRadarChart;
