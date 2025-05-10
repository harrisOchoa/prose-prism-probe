
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Calculator, 
  Loader2, 
  RefreshCw, 
  FileDown,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import ReportBuilder from "./ReportBuilder";

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
    contentType: "Overview" | "Aptitude" | "Writing" | "WritingAnalysis" | "Personality" | "ProfileMatch" | "InterviewQuestions" | string[],
    templateName?: string
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
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);
  
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
  
  const handleExportSections = async (sections: string[], templateName: string) => {
    if (handleExportPdf) {
      await handleExportPdf(
        {
          candidateName: assessmentData?.candidateName || "Candidate",
          candidatePosition: assessmentData?.candidatePosition || "Unknown Position"
        },
        sections,
        templateName
      );
    }
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline"
                className={cn(
                  "flex-1 sm:flex-none shadow-subtle hover:shadow-elevation-1 transition-all",
                  "hover:bg-hirescribe-muted border-hirescribe-primary/20"
                )}
              >
                <FileDown className="mr-2 h-4 w-4 text-hirescribe-primary" />
                Export Report
                <ChevronDown className="ml-2 h-4 w-4 text-hirescribe-primary/70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => setReportBuilderOpen(true)}
                className="cursor-pointer"
              >
                <FileDown className="mr-2 h-4 w-4" />
                <span>Build Complete Report</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleExportPdf(
                  {
                    candidateName: assessmentData?.candidateName || "Candidate",
                    candidatePosition: assessmentData?.candidatePosition || "Unknown Position"
                  },
                  "Overview"
                )}
                className="cursor-pointer"
              >
                Export Overview
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExportPdf(
                  {
                    candidateName: assessmentData?.candidateName || "Candidate",
                    candidatePosition: assessmentData?.candidatePosition || "Unknown Position"
                  },
                  "Aptitude"
                )}
                className="cursor-pointer"
              >
                Export Aptitude Assessment
              </DropdownMenuItem>
              {hasValidWritingScores && (
                <DropdownMenuItem
                  onClick={() => handleExportPdf(
                    {
                      candidateName: assessmentData?.candidateName || "Candidate",
                      candidatePosition: assessmentData?.candidatePosition || "Unknown Position"
                    },
                    "Writing"
                  )}
                  className="cursor-pointer"
                >
                  Export Writing Assessment
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
      
      {handleExportPdf && (
        <ReportBuilder
          isOpen={reportBuilderOpen}
          onClose={() => setReportBuilderOpen(false)}
          assessmentData={assessmentData}
          onExport={handleExportSections}
        />
      )}
    </div>
  );
};

export default AssessmentHeader;
