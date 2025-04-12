
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
    <div className="w-full h-[300px] mt-4">
      <ChartContainer 
        config={{
          skills: { theme: { light: '#3b82f6', dark: '#60a5fa' } }
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart 
            cx="50%" 
            cy="50%" 
            outerRadius="70%" 
            data={chartData}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis angle={30} domain={[0, 5]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Radar 
              name="Skills" 
              dataKey="score" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.6} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default SkillsRadarChart;
