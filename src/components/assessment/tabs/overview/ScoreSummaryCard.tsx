
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { FileCheck } from "lucide-react";

interface ScoreSummaryCardProps {
  assessmentData: any;
  getAptitudeScorePercentage: () => number;
  getWritingScorePercentage: () => number;
  getOverallScore: () => number;
}

const ScoreSummaryCard: React.FC<ScoreSummaryCardProps> = ({
  assessmentData,
  getAptitudeScorePercentage,
  getWritingScorePercentage,
  getOverallScore,
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <FileCheck className="mr-2 h-5 w-5 text-green-500" />
          Assessment Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Aptitude Score</TableCell>
              <TableCell className="text-right">
                <span className={`px-2 py-1 rounded ${getAptitudeScorePercentage() >= 70 ? 'bg-green-100 text-green-700' : getAptitudeScorePercentage() >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {assessmentData.aptitudeScore}/{assessmentData.aptitudeTotal} ({getAptitudeScorePercentage()}%)
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Writing Score</TableCell>
              <TableCell className="text-right">
                {assessmentData.overallWritingScore ? (
                  <span className={`px-2 py-1 rounded ${getWritingScorePercentage() >= 70 ? 'bg-green-100 text-green-700' : getWritingScorePercentage() >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {assessmentData.overallWritingScore}/5 ({getWritingScorePercentage()}%)
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">Not Evaluated</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Overall Rating</TableCell>
              <TableCell className="text-right">
                <span className={`px-2 py-1 rounded ${getOverallScore() >= 70 ? 'bg-green-100 text-green-700' : getOverallScore() >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {getOverallScore()}%
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ScoreSummaryCard;
