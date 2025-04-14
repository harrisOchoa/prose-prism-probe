
import { toast } from "@/hooks/use-toast";
import { exportToPdf } from "@/utils/pdfExport";
import { AssessmentData } from "@/hooks/useAssessmentView";
import { useState } from "react";

export const usePdfExport = () => {
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async (assessment: AssessmentData) => {
    if (exporting) return;
    
    setExporting(true);
    
    toast({
      title: "Preparing PDF",
      description: "Creating a professional report of this assessment...",
    });
    
    try {
      console.log("Starting PDF export process for", assessment.candidateName);
      
      // Format the filename based on candidate name and position
      const formattedName = assessment.candidateName.toLowerCase().replace(/\s+/g, '');
      const formattedPosition = assessment.candidatePosition.toLowerCase().replace(/\s+/g, '');
      const filename = `${formattedName}_${formattedPosition}_hirescribe`;
      
      // Calculate how many pages we expect based on available data
      let expectedPages = 1; // Overview page is always included
      if (assessment.detailedWritingAnalysis) expectedPages++;
      if (assessment.personalityInsights) expectedPages++;
      if (assessment.profileMatch) expectedPages++;
      
      console.log(`PDF Export: Preparing to generate ${expectedPages} pages`);
      
      const success = await exportToPdf("assessment-content", filename, assessment);
      
      if (success) {
        toast({
          title: "PDF Exported Successfully",
          description: `Assessment report has been downloaded with ${expectedPages} pages.`,
          variant: "default",
        });
      } else {
        toast({
          title: "PDF Export Failed",
          description: "There was an error creating the PDF. Please try again or check browser console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during PDF export:", error);
      toast({
        title: "PDF Export Failed",
        description: "There was an unexpected error. Please try using a different browser or contact support.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return { handleExportPdf, exporting };
};
