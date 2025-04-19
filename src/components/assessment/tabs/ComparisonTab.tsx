import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { getBenchmarkData, calculatePercentile, generateComparisonData } from "@/utils/benchmarkCalculations";

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
  const benchmarkData = getBenchmarkData();
  
  const comparisonData = generateComparisonData(
    getOverallScore,
    getWritingScorePercentage,
    getAptitudeScorePercentage,
    benchmarkData
  );

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
                    Comparing this candidate against the average score and top performer in the assessment pool.
                  </p>
                </TooltipContent>
              </Tooltip>
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
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <RechartsTooltip formatter={(value) => [`${value}%`, null]} />
                <Legend />
                <Bar dataKey="Candidate" fill="#3b82f6" name="This Candidate" />
                <Bar dataKey="Average" fill="#9ca3af" name="Average Candidate" />
                <Bar dataKey="Top" fill="#22c55e" name="Top Performer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Benchmark Details</CardTitle>
          <CardDescription>
            How this candidate compares to others for this position
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableCell>{benchmarkData.averageScore}%</TableCell>
                <TableCell>{benchmarkData.topScore}%</TableCell>
                <TableCell>
                  {calculatePercentile(getOverallScore(), benchmarkData.averageScore)}th
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Aptitude</TableCell>
                <TableCell>{getAptitudeScorePercentage()}%</TableCell>
                <TableCell>{benchmarkData.averageAptitude}%</TableCell>
                <TableCell>{benchmarkData.topAptitude}%</TableCell>
                <TableCell>
                  {calculatePercentile(getAptitudeScorePercentage(), benchmarkData.averageAptitude)}th
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Writing</TableCell>
                <TableCell>{getWritingScorePercentage()}%</TableCell>
                <TableCell>{benchmarkData.averageWriting}%</TableCell>
                <TableCell>{benchmarkData.topWriting}%</TableCell>
                <TableCell>
                  {calculatePercentile(getWritingScorePercentage(), benchmarkData.averageWriting)}th
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Word Count</TableCell>
                <TableCell>{assessmentData.wordCount || 0} words</TableCell>
                <TableCell>{benchmarkData.averageWordCount} words</TableCell>
                <TableCell>{benchmarkData.topWordCount} words</TableCell>
                <TableCell>
                  {calculatePercentile(assessmentData.wordCount || 0, benchmarkData.averageWordCount)}th
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default CandidateComparison;
