
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdvancedAnalysisContent from "./advanced-analysis/AdvancedAnalysisContent";

interface AdvancedAnalysisProps {
  assessmentData: any;
  getProgressColor: (value: number) => string;
  generateAdvancedAnalysis: (analysisType: string) => Promise<any>;
  generatingAnalysis: {[key: string]: boolean};
}

const AdvancedAnalysis = ({
  assessmentData,
  getProgressColor,
  generateAdvancedAnalysis,
  generatingAnalysis = {}
}: AdvancedAnalysisProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            Advanced Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AdvancedAnalysisContent
            assessmentData={assessmentData}
            getProgressColor={getProgressColor}
            generateAdvancedAnalysis={generateAdvancedAnalysis}
            generatingAnalysis={generatingAnalysis}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalysis;
