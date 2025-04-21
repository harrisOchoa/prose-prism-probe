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
import { questionBank } from "@/utils/questionBank";

const getQuestionLabel = (promptId: number) => {
  return `Question ${promptId}`;
};

interface SkillsRadarChartProps {
  writingScores: WritingScore[];
  aptitudeScore: number;
  aptitudeTotal: number;
}

const getScoreColorClass = (score: number) => {
  if (score >= 4.5) return "text-green-600";
  if (score >= 3.5) return "text-blue-600";
  if (score >= 2.5) return "text-yellow-600";
  if (score >= 1.5) return "text-orange-600";
  return "text-red-600";
};

const getAptitudeLabel = () => "Aptitude Test Score";

const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({ 
  writingScores, 
  aptitudeScore,
  aptitudeTotal
}) => {
  const validScores = writingScores?.filter(score => score.score > 0) || [];
  
  const categorizedScores: Record<string, number[]> = {};
  validScores.forEach(score => {
    const category = score.promptId || "General Writing";
    if (!categorizedScores[category]) {
      categorizedScores[category] = [];
    }
    categorizedScores[category].push(score.score);
  });
  
  const chartData = Object.entries(categorizedScores).map(([category, scores]) => {
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return {
      category: category.length > 10 ? category.substring(0, 10) + "..." : category,
      fullName: category,
      score: Number(avgScore.toFixed(1)),
      fullMark: 5
    };
  });
  
  chartData.push({
    category: "Aptitude",
    fullName: "Aptitude Test Score",
    score: Number(((aptitudeScore / aptitudeTotal) * 5).toFixed(1)),
    fullMark: 5
  });

  const cardsData = [
    ...validScores.map(ws => ({
      key: `ws-${ws.promptId}`,
      label: getQuestionLabel(ws.promptId),
      value: ws.score,
      valueDisplay: `${ws.score.toFixed(1)}/5`,
      description: questionBank.find(q => q.id === ws.promptId)?.prompt || "",
      colorClass: getScoreColorClass(ws.score)
    })),
    {
      key: "aptitude",
      label: getAptitudeLabel(),
      value: aptitudeScore,
      valueDisplay: `${aptitudeScore}/${aptitudeTotal ?? ""}`,
      description: "",
      colorClass: "text-yellow-600"
    }
  ];

  return (
    <Card className="border shadow-elevation-1 animate-fade-in overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-lg font-medium">Skills Assessment</CardTitle>
        <Zap className="h-5 w-5 text-hirescribe-primary" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 h-[320px]">
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
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="flex flex-row flex-wrap gap-4 justify-start items-stretch">
              {cardsData.map(card => (
                <div
                  key={card.key}
                  className="flex flex-grow basis-[180px] max-w-[240px] bg-[#F1F0FB] border border-gray-200 rounded-lg px-4 py-3 mb-2 flex flex-col items-center shadow-sm"
                  title={card.description}
                >
                  <span className="text-xs font-semibold text-gray-600 mb-1">{card.label}</span>
                  <span className={`text-xl font-bold ${card.colorClass}`}>{card.valueDisplay}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsRadarChart;
