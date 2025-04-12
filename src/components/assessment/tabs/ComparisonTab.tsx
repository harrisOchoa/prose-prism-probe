
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

interface ComparisonChartProps {
  comparisonData: any[];
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ comparisonData }) => {
  return (
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
          <RechartsTooltip formatter={(value) => [`${value}%`, null]} />
          <Legend />
          <Bar dataKey="Candidate" fill="#3b82f6" name="This Candidate" />
          <Bar dataKey="Average" fill="#9ca3af" name="Average Candidate" />
          <Bar dataKey="Top" fill="#22c55e" name="Top Performer" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface BenchmarkTableProps {
  assessmentData: any;
  getAptitudeScorePercentage: () => number;
  getWritingScorePercentage: () => number;
  getOverallScore: () => number;
}

const BenchmarkTable: React.FC<BenchmarkTableProps> = ({
  assessmentData,
  getAptitudeScorePercentage,
  getWritingScorePercentage,
  getOverallScore
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Metric</TableHead>
          <TableHead>This Candidate</TableHead>
          <TableHead>Average</TableHead>
          <TableHead>Top Performer</TableHead>
          <TableHead>Percentile</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Overall Score</TableCell>
          <TableCell>{getOverallScore()}%</TableCell>
          <TableCell>72%</TableCell>
          <TableCell>94%</TableCell>
          <TableCell>
            {Math.round((getOverallScore() / 72) * 50)}th
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Aptitude</TableCell>
          <TableCell>{getAptitudeScorePercentage()}%</TableCell>
          <TableCell>68%</TableCell>
          <TableCell>92%</TableCell>
          <TableCell>
            {Math.round((getAptitudeScorePercentage() / 68) * 50)}th
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Writing</TableCell>
          <TableCell>{getWritingScorePercentage()}%</TableCell>
          <TableCell>76%</TableCell>
          <TableCell>96%</TableCell>
          <TableCell>
            {Math.round((getWritingScorePercentage() / 76) * 50)}th
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Word Count</TableCell>
          <TableCell>{assessmentData.wordCount} words</TableCell>
          <TableCell>450 words</TableCell>
          <TableCell>750 words</TableCell>
          <TableCell>
            {Math.round((assessmentData.wordCount / 450) * 50)}th
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

interface CandidateComparisonProps {
  assessmentData: any;
  getAptitudeScorePercentage: () => number;
  getWritingScorePercentage: () => number;
  getOverallScore: () => number;
}

const CandidateComparison: React.FC<CandidateComparisonProps> = ({ 
  assessmentData,
  getAptitudeScorePercentage,
  getWritingScorePercentage,
  getOverallScore 
}) => {
  // Mock data - would come from real averages in production
  const averageScore = 72;
  const topScore = 94;
  
  const comparisonData = [
    {
      name: "Overall Score",
      Candidate: getOverallScore(),
      Average: averageScore,
      Top: topScore
    },
    {
      name: "Writing",
      Candidate: Math.round((getOverallScore() * 1.1) > 100 ? 100 : (getOverallScore() * 1.1)),
      Average: Math.round((averageScore * 0.9) > 100 ? 100 : (averageScore * 0.9)),
      Top: Math.round((topScore * 1.05) > 100 ? 100 : (topScore * 1.05))
    },
    {
      name: "Aptitude",
      Candidate: Math.round((getOverallScore() * 0.95) > 100 ? 100 : (getOverallScore() * 0.95)),
      Average: Math.round((averageScore * 1.1) > 100 ? 100 : (averageScore * 1.1)),
      Top: Math.round(topScore)
    }
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center">
            <CardTitle className="text-lg mr-2">Candidate Comparison</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Comparing this candidate against the average score and top performer in your assessment pool.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Users className="h-5 w-5 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <ComparisonChart comparisonData={comparisonData} />
        </CardContent>
      </Card>
            
      <Card>
        <CardHeader>
          <CardTitle>Benchmark Details</CardTitle>
          <CardDescription>
            How this candidate compares to others for this position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BenchmarkTable 
            assessmentData={assessmentData}
            getAptitudeScorePercentage={getAptitudeScorePercentage}
            getWritingScorePercentage={getWritingScorePercentage}
            getOverallScore={getOverallScore}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default CandidateComparison;
