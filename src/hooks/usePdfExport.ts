
import { toast } from "@/hooks/use-toast";
import { exportToPdf } from "@/utils/pdfExport";

export const usePdfExport = () => {
  const handleExportPdf = async () => {
    toast({
      title: "Preparing PDF",
      description: "Creating a professional report of this assessment...",
    });
    
    // Before generating PDF, add classes to hide/show specific elements in PDF
    document.querySelectorAll('.pdf-hide').forEach((el) => {
      el.classList.add('hidden-for-pdf');
    });
    
    document.querySelectorAll('.pdf-show').forEach((el) => {
      el.classList.add('visible-for-pdf');
    });
    
    const success = await exportToPdf("assessment-content", `Assessment_Report`);
    
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
