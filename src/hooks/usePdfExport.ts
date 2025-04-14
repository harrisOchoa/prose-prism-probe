
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
      // Format the filename based on candidate name and position
      const formattedName = assessment.candidateName.toLowerCase().replace(/\s+/g, '');
      const formattedPosition = assessment.candidatePosition.toLowerCase().replace(/\s+/g, '');
      const filename = `${formattedName}_${formattedPosition}_hirescribe`;
      
      // Before generating PDF, add classes to hide/show specific elements in PDF
      document.querySelectorAll('.pdf-hide').forEach((el) => {
        el.classList.add('hidden-for-pdf');
      });
      
      document.querySelectorAll('.pdf-show').forEach((el) => {
        el.classList.add('visible-for-pdf');
      });
      
      // Add a small delay to ensure DOM updates before PDF generation
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const success = await exportToPdf("assessment-content", filename, assessment);
      
      // Restore the DOM after PDF generation
      document.querySelectorAll('.hidden-for-pdf').forEach((el) => {
        el.classList.remove('hidden-for-pdf');
      });
      
      document.querySelectorAll('.visible-for-pdf').forEach((el) => {
        el.classList.remove('visible-for-pdf');
      });
      
      if (success) {
        toast({
          title: "PDF Exported Successfully",
          description: "The assessment report has been downloaded.",
          variant: "default",
        });
      } else {
        toast({
          title: "PDF Export Failed",
          description: "There was an error creating the PDF. Please try again with a different browser or contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during PDF export:", error);
      toast({
        title: "PDF Export Failed",
        description: "There was an unexpected error. Please try again with a different browser or contact support.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return { handleExportPdf, exporting };
};
