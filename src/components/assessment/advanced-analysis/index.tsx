
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdvancedAnalysisContent from "./AdvancedAnalysisContent";

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
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Advanced Analysis</CardTitle>
        </CardHeader>
        <CardContent>
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
