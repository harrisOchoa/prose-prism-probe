
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Users, Info } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CandidateComparisonProps {
  candidateScore: number;
  averageScore: number;
  topScore: number;
}

const CandidateComparison: React.FC<CandidateComparisonProps> = ({ 
  candidateScore, 
  averageScore, 
  topScore 
}) => {
  const comparisonData = [
    {
      name: "Overall Score",
      Candidate: candidateScore,
      Average: averageScore,
      Top: topScore
    },
    {
      name: "Writing",
      Candidate: Math.round((candidateScore * 1.1) > 100 ? 100 : (candidateScore * 1.1)),
      Average: Math.round((averageScore * 0.9) > 100 ? 100 : (averageScore * 0.9)),
      Top: Math.round((topScore * 1.05) > 100 ? 100 : (topScore * 1.05))
    },
    {
      name: "Aptitude",
      Candidate: Math.round((candidateScore * 0.95) > 100 ? 100 : (candidateScore * 0.95)),
      Average: Math.round((averageScore * 1.1) > 100 ? 100 : (averageScore * 1.1)),
      Top: Math.round(topScore)
    }
  ];

  const colors = {
    Candidate: "#4F46E5", // hirescribe-primary
    Average: "#9ca3af",   // gray-400
    Top: "#10b981"        // success green
  };

  return (
    <Card className="border shadow-elevation-1 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <div className="flex items-center">
          <CardTitle className="text-lg font-medium mr-2">Candidate Comparison</CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-white shadow-elevation-2 p-3 max-w-xs">
                <p className="text-sm">
                  Comparing this candidate against the average score and top performer in your assessment pool.
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <Users className="h-5 w-5 text-hirescribe-primary" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barGap={8}
              barCategoryGap={20}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip 
                formatter={(value) => [`${value}%`, null]} 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #eee',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  padding: '8px 12px' 
                }}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: 10,
                  fontSize: 12
                }}
              />
              <Bar 
                dataKey="Candidate" 
                fill={colors.Candidate} 
                name="This Candidate" 
                radius={[4, 4, 0, 0]} 
                animationDuration={750}
              />
              <Bar 
                dataKey="Average" 
                fill={colors.Average} 
                name="Average Candidate" 
                radius={[4, 4, 0, 0]} 
                animationDuration={750}
                animationBegin={250}
              />
              <Bar 
                dataKey="Top" 
                fill={colors.Top} 
                name="Top Performer" 
                radius={[4, 4, 0, 0]} 
                animationDuration={750}
                animationBegin={500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateComparison;
