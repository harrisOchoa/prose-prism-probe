
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Calculator, 
  FileText, 
  Loader2, 
  RefreshCw, 
  Download,
  FileUp
} from "lucide-react";

interface AssessmentHeaderProps {
  assessmentData: any;
  onBack: () => void;
  evaluating: boolean;
  generatingSummary: boolean;
  handleManualEvaluation: () => void;
  regenerateInsights: () => void;
  handleExportPdf?: () => void;
}

const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  assessmentData,
  onBack,
  evaluating,
  generatingSummary,
  handleManualEvaluation,
  regenerateInsights,
  handleExportPdf
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">{assessmentData.candidateName}</h1>
          <p className="text-sm text-muted-foreground">
            {assessmentData.candidatePosition || "Position not specified"}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        {handleExportPdf && (
          <Button 
            variant="secondary"
            onClick={handleExportPdf}
            className="flex-1 sm:flex-none"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        )}
        
        {assessmentData.writingScores && assessmentData.writingScores.length > 0 ? (
          <Button 
            variant="secondary" 
            onClick={regenerateInsights} 
            disabled={generatingSummary}
            className="flex-1 sm:flex-none"
          >
            {generatingSummary ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Insights
              </>
            )}
          </Button>
        ) : (
          <Button 
            variant="default" 
            onClick={handleManualEvaluation} 
            disabled={evaluating}
            className="flex-1 sm:flex-none"
          >
            {evaluating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Evaluating
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Evaluate Writing
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AssessmentHeader;
