
import { toast } from "@/hooks/use-toast";
import { exportToPdf } from "@/utils/pdfExport";
import { AssessmentData } from "@/hooks/useAssessmentView";

export const usePdfExport = () => {
  const handleExportPdf = async (assessment: AssessmentData) => {
    toast({
      title: "Preparing PDF",
      description: "Creating a professional report of this assessment...",
    });
    
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
        description: "There was an error creating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handleExportPdf };
};
