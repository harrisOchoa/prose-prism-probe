
import { toast } from "@/hooks/use-toast";
import { exportToPdf } from "@/utils/pdfExport";

export const usePdfExport = () => {
  const handleExportPdf = async (
    assessmentData: {
      candidateName: string;
      candidatePosition: string;
    },
    contentType: "Overview" | "Aptitude" | "Writing" | "WritingAnalysis" | "Personality" | "ProfileMatch" | "InterviewQuestions"
  ) => {
    toast({
      title: "Preparing PDF",
      description: "Creating a professional report of this assessment...",
    });
    
    // Apply custom styles for PDF export
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .pdf-content * {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .pdf-content {
        padding: 10px !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Format filename components
    const formattedName = assessmentData.candidateName.replace(/\s+/g, '');
    const formattedPosition = assessmentData.candidatePosition.replace(/\s+/g, '');
    const filename = `${formattedName}_${formattedPosition}_${contentType}_HireScribe`;
    
    // Before generating PDF, add classes to hide/show specific elements in PDF
    document.querySelectorAll('.pdf-hide').forEach((el) => {
      el.classList.add('hidden-for-pdf');
    });
    
    document.querySelectorAll('.pdf-show').forEach((el) => {
      el.classList.add('visible-for-pdf');
    });
    
    try {
      // Add a temporary class to the assessment content for PDF-specific styling
      const contentElement = document.getElementById('assessment-content');
      if (contentElement) {
        contentElement.classList.add('pdf-content');
      }
      
      const success = await exportToPdf("assessment-content", filename);
      
      // Clean up: remove the temporary class
      if (contentElement) {
        contentElement.classList.remove('pdf-content');
      }
      
      // Restore the DOM after PDF generation
      document.querySelectorAll('.hidden-for-pdf').forEach((el) => {
        el.classList.remove('hidden-for-pdf');
      });
      
      document.querySelectorAll('.visible-for-pdf').forEach((el) => {
        el.classList.remove('visible-for-pdf');
      });
      
      // Remove custom styles
      document.head.removeChild(styleElement);
      
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
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "PDF Export Failed",
        description: "There was an error creating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handleExportPdf };
};
