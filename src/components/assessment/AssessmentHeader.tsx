
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
  handleExportPdf?: (
    assessmentData: {
      candidateName: string;
      candidatePosition: string;
    },
    contentType: "Overview" | "Aptitude" | "Writing" | "WritingAnalysis" | "Personality" | "ProfileMatch" | "InterviewQuestions"
  ) => Promise<void>;
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
  // Check if writing scores exist and if they are valid
  const hasValidWritingScores = assessmentData?.writingScores && 
    assessmentData.writingScores.length > 0 && 
    assessmentData.writingScores.some(score => score.score > 0);

  // Log for debugging
  console.log("Assessment Header - Writing Scores:", assessmentData?.writingScores);
  console.log("Has Valid Writing Scores:", hasValidWritingScores);
  console.log("Evaluating state:", evaluating);
  console.log("GeneratingSummary state:", generatingSummary);
  
  // Disable button conditions
  const isEvaluateDisabled = evaluating || generatingSummary;
  const isRegenerateDisabled = generatingSummary || !hasValidWritingScores;
  
  const handleEvaluateClick = () => {
    console.log("Evaluate button clicked");
    handleManualEvaluation();
  };
  
  const handleRegenerateClick = () => {
    console.log("Regenerate button clicked");
    regenerateInsights();
  };
  
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
          <h1 className="text-xl font-semibold gradient-text">
            {assessmentData?.candidateName || "Candidate Name"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {assessmentData?.candidatePosition || "Position not specified"}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 w-full sm:w-auto">
        {handleExportPdf && (
          <Button 
            variant="outline"
            onClick={() => handleExportPdf(
              {
                candidateName: assessmentData?.candidateName || "Candidate",
                candidatePosition: assessmentData?.candidatePosition || "Unknown Position"
              },
              "Overview" // Default to Overview, can be made dynamic if needed
            )}
            className={cn(
              "flex-1 sm:flex-none shadow-subtle hover:shadow-elevation-1 transition-all",
              "hover:bg-hirescribe-muted"
            )}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        )}
        
        {hasValidWritingScores ? (
          <Button 
            variant="secondary" 
            onClick={handleRegenerateClick} 
            disabled={isRegenerateDisabled}
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
            onClick={handleEvaluateClick} 
            disabled={isEvaluateDisabled}
            className="flex-1 sm:flex-none pdf-hide bg-hirescribe-primary hover:bg-hirescribe-accent transition-colors shadow-subtle hover:shadow-elevation-1"
          >
            {evaluating || generatingSummary ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {evaluating ? "Evaluating..." : "Generating..."}
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
