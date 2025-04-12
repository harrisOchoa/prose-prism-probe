
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <CardTitle className="text-lg mr-2">Candidate Comparison</CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Comparing this candidate against the average score and top performer in your assessment pool.
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <Users className="h-5 w-5 text-indigo-500" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, null]} />
              <Legend />
              <Bar dataKey="Candidate" fill="#3b82f6" name="This Candidate" />
              <Bar dataKey="Average" fill="#9ca3af" name="Average Candidate" />
              <Bar dataKey="Top" fill="#22c55e" name="Top Performer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateComparison;
