
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Calculator, 
  Loader2, 
  RefreshCw, 
  FileUp
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-lg border shadow-subtle animate-fade-in hover:shadow-elevation-1 transition-all">
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onBack}
          className="rounded-full hover:bg-hirescribe-muted transition-colors shadow-subtle"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold gradient-text">{assessmentData.candidateName}</h1>
          <p className="text-sm text-muted-foreground">
            {assessmentData.candidatePosition || "Position not specified"}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 w-full sm:w-auto">
        {handleExportPdf && (
          <Button 
            variant="outline"
            onClick={handleExportPdf}
            className={cn(
              "flex-1 sm:flex-none shadow-subtle hover:shadow-elevation-1 transition-all",
              "hover:bg-hirescribe-muted"
            )}
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
            className={cn(
              "flex-1 sm:flex-none pdf-hide shadow-subtle hover:shadow-elevation-1 transition-all",
              "bg-hirescribe-secondary/10 hover:bg-hirescribe-secondary/20 text-hirescribe-primary"
            )}
          >
            {generatingSummary ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
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
            className="flex-1 sm:flex-none pdf-hide bg-hirescribe-primary hover:bg-hirescribe-accent transition-colors shadow-subtle hover:shadow-elevation-1"
          >
            {evaluating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Evaluating...
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
