
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
      /* PDF Content Global Styles */
      .pdf-content * {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .pdf-content {
        padding: 10px !important;
        max-width: 100% !important;
        font-family: 'Inter', sans-serif !important;
      }
      .pdf-content .card,
      .pdf-content .assessment-card {
        margin-bottom: 15px !important;
        border: 1px solid #e5e7eb !important;
        box-shadow: none !important;
      }
      
      /* Header and title styling */
      .pdf-content h1, 
      .pdf-content h2, 
      .pdf-content h3 {
        color: #4F46E5 !important;
        margin-bottom: 8px !important;
      }
      
      /* Ensure tables are clean and minimal */
      .pdf-content table {
        border-collapse: collapse !important;
        width: 100% !important;
        margin-bottom: 10px !important;
        font-size: 11px !important;
      }
      .pdf-content th {
        background-color: #F5F7FF !important;
        color: #4F46E5 !important;
        font-weight: 600 !important;
        border: 1px solid #e5e7eb !important;
        padding: 6px !important;
        text-align: left !important;
      }
      .pdf-content td {
        padding: 6px !important;
        border: 1px solid #e5e7eb !important;
      }
      
      /* Chart optimizations */
      .pdf-content .recharts-wrapper {
        margin: 0 auto !important;
      }
      
      /* Card styling */
      .pdf-layout-portrait .assessment-card,
      .pdf-layout-portrait .card {
        padding: 15px !important;
        box-shadow: none !important;
      }
      
      /* Progress bars */
      .pdf-layout-portrait .progress {
        height: 8px !important;
        margin-bottom: 10px !important;
      }
      
      /* Typography */
      .pdf-layout-portrait p {
        margin-bottom: 5px !important;
        font-size: 11px !important;
        line-height: 1.4 !important;
      }
      .pdf-layout-portrait .text-xs {
        font-size: 9px !important;
      }
      .pdf-layout-portrait .text-sm {
        font-size: 10px !important; 
      }
      .pdf-layout-portrait .text-lg {
        font-size: 13px !important;
      }
      
      /* Branding elements */
      .pdf-branding-header {
        display: block !important;
        border-bottom: 1px solid #e5e7eb !important;
        margin-bottom: 15px !important;
        padding-bottom: 10px !important;
      }
      .pdf-branding-footer {
        display: block !important;
        border-top: 1px solid #e5e7eb !important;
        margin-top: 15px !important;
        padding-top: 10px !important;
        font-size: 9px !important;
        color: #6b7280 !important;
        text-align: center !important;
      }
      
      /* Make card backgrounds white */
      .pdf-content .bg-muted\/50 {
        background-color: white !important;
      }
      
      /* Enhance card headers */
      .pdf-content .card-header {
        border-bottom: 2px solid #EEF2FF !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Format filename components
    const formattedName = assessmentData.candidateName.replace(/\s+/g, '');
    const formattedPosition = assessmentData.candidatePosition.replace(/\s+/g, '');
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `${formattedName}_${formattedPosition}_${contentType}_${timestamp}`;
    
    // Before generating PDF, add classes to hide/show specific elements
    document.querySelectorAll('.pdf-hide').forEach((el) => {
      el.classList.add('hidden-for-pdf');
    });
    
    document.querySelectorAll('.pdf-show').forEach((el) => {
      el.classList.add('visible-for-pdf');
    });
    
    // Add branding elements programmatically
    const contentElement = document.getElementById('assessment-content');
    if (contentElement) {
      // Add PDF-specific styling class
      contentElement.classList.add('pdf-content');
      
      // Create branding header if it doesn't exist
      if (!contentElement.querySelector('.pdf-branding-header')) {
        const brandingHeader = document.createElement('div');
        brandingHeader.className = 'pdf-branding-header pdf-show visible-for-pdf';
        brandingHeader.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-size:18px;font-weight:bold;color:#4F46E5;">HireScribe Assessment</div>
            <div style="font-size:12px;color:#6b7280;">CONFIDENTIAL</div>
          </div>
          <div style="font-size:14px;color:#6b7280;margin-top:4px">
            ${assessmentData.candidateName} - ${assessmentData.candidatePosition}
          </div>
        `;
        contentElement.insertBefore(brandingHeader, contentElement.firstChild);
      }
      
      // Create branding footer if it doesn't exist
      if (!contentElement.querySelector('.pdf-branding-footer')) {
        const brandingFooter = document.createElement('div');
        brandingFooter.className = 'pdf-branding-footer pdf-show visible-for-pdf';
        brandingFooter.innerHTML = `
          <div>HireScribe Assessment Platform © ${new Date().getFullYear()}</div>
          <div style="margin-top:2px">This report is confidential and intended for authorized personnel only.</div>
        `;
        contentElement.appendChild(brandingFooter);
      }
    }
    
    try {
      // Generate the PDF
      const success = await exportToPdf("assessment-content", filename);
      
      // Clean up: remove temporary elements and classes
      if (contentElement) {
        contentElement.classList.remove('pdf-content');
        
        // Remove temporary branding elements
        const headerEl = contentElement.querySelector('.pdf-branding-header');
        if (headerEl) headerEl.remove();
        
        const footerEl = contentElement.querySelector('.pdf-branding-footer');
        if (footerEl) footerEl.remove();
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
      
      // Show appropriate toast message
      if (success) {
        toast({
          title: "PDF Exported Successfully",
          description: "The professional assessment report has been downloaded.",
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
