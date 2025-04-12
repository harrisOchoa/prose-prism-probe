
import { toast } from "@/hooks/use-toast";
import { exportToPdf } from "@/utils/pdfExport";

export const usePdfExport = () => {
  const handleExportPdf = async () => {
    toast({
      title: "Preparing PDF",
      description: "Creating a professional report of this assessment...",
    });
    
    const success = await exportToPdf("assessment-content", `Assessment_Report`);
    
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
