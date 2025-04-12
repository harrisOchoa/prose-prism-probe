
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, BrainCircuit, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { exportToPdf } from "@/utils/pdfExport";

interface AssessmentHeaderProps {
  assessmentData: any;
  onBack: () => void;
  evaluating: boolean;
  generatingSummary: boolean;
  handleManualEvaluation: () => Promise<void>;
  regenerateInsights: () => Promise<void>;
}

const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  assessmentData,
  onBack,
  evaluating,
  generatingSummary,
  handleManualEvaluation,
  regenerateInsights
}) => {
  const handlePrintPdf = async () => {
    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your PDF...",
    });
    
    const success = await exportToPdf("assessment-content", `${assessmentData.candidateName}-Assessment`);
    
    if (success) {
      toast({
        title: "PDF Generated",
        description: "Assessment has been exported to PDF successfully.",
      });
    } else {
      toast({
        title: "PDF Generation Failed",
        description: "There was an error exporting to PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Assessment Details</h1>
      </div>
      <div className="space-x-2">
        <Button 
          onClick={handlePrintPdf} 
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        >
          <Printer className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
        <Button 
          onClick={regenerateInsights} 
          disabled={evaluating || generatingSummary || !assessmentData.writingScores} 
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
        >
          <BrainCircuit className="mr-2 h-4 w-4" />
          {generatingSummary ? "Processing..." : "Regenerate Insights"}
        </Button>
        <Button 
          onClick={handleManualEvaluation} 
          disabled={evaluating || generatingSummary} 
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Zap className="mr-2 h-4 w-4" />
          {evaluating ? "Processing..." : "Evaluate Writing"}
        </Button>
      </div>
    </div>
  );
};

export default AssessmentHeader;
