import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Enhanced PDF export with professional formatting
export const exportToPdf = async (elementId: string, filename: string) => {
  try {
    console.log(`Starting PDF export for element: ${elementId}`);
    
    // Get the content element
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Add classes for PDF export
    document.querySelectorAll('.pdf-hide').forEach((el) => {
      el.classList.add('hidden-for-pdf');
    });

    document.querySelectorAll('.pdf-show').forEach((el) => {
      el.classList.add('visible-for-pdf');
    });

    // Use a higher scale for better quality
    const scale = 2;
    
    // Create a deep clone to avoid modifying the original DOM
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Create wrapper with specific dimensions for PDF
    const wrapper = document.createElement('div');
    wrapper.style.width = '800px'; // Optimized for portrait A4
    wrapper.style.padding = '20px';
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.classList.add('pdf-wrapper');
    
    // Add the clone to the wrapper
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    
    // Apply PDF-specific styles
    clone.classList.add('pdf-layout-portrait');

    // Log what we're capturing
    console.log(`PDF Export - Content prepared, capturing with html2canvas...`);
    
    // Create canvas from the wrapper with high resolution
    const canvas = await html2canvas(wrapper, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      ignoreElements: (element) => {
        // Don't ignore elements marked as visible for PDF
        if (element.classList && (
            element.classList.contains('pdf-show') || 
            element.classList.contains('visible-for-pdf')
        )) {
          return false;
        }
        
        // Hide elements marked as hidden for PDF
        if (element.classList && element.classList.contains('hidden-for-pdf')) {
          return true;
        }
        
        // Special handling for tab panels - only hide if both conditions are true:
        // 1. It has role="tabpanel" 
        // 2. It's not marked with data-state="active" AND it's not inside a pdf-content container
        if (element.hasAttribute('role') && element.getAttribute('role') === 'tabpanel') {
          const isInsidePdfContent = !!element.closest('.pdf-content');
          
          // If it's inside pdf-content, we don't want to ignore it
          if (isInsidePdfContent) {
            return false;
          }
          
          // Otherwise, only include active panels
          return element.getAttribute('data-state') !== 'active';
        }
        
        // Default case - don't ignore
        return false;
      }
    });
    
    console.log(`PDF Export - Canvas generated, size: ${canvas.width}x${canvas.height}`);
    
    // Clean up - remove the wrapper from DOM
    document.body.removeChild(wrapper);

    // Restore DOM classes
    document.querySelectorAll('.hidden-for-pdf').forEach((el) => {
      el.classList.remove('hidden-for-pdf');
    });
    document.querySelectorAll('.visible-for-pdf').forEach((el) => {
      el.classList.remove('visible-for-pdf');
    });

    // Get image data from canvas
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate dimensions based on aspect ratio
    const aspectRatio = canvas.width / canvas.height;
    
    // A4 dimensions in mm
    const pageWidth = 210;  // A4 width
    const pageHeight = 297; // A4 height
    
    // Set margins and spacing
    const margin = 10;
    const headerHeight = 30;
    const footerHeight = 20;
    
    // Calculate content area dimensions
    const contentTop = headerHeight + margin;
    const contentBottom = pageHeight - footerHeight - margin;
    const availableHeight = contentBottom - contentTop;
    const availableWidth = pageWidth - (margin * 2);
    
    // Scale image to fit content area while maintaining aspect ratio
    let imgWidth = availableWidth;
    let imgHeight = imgWidth / aspectRatio;
    
    // If the content is very long, we need to determine how many pages to create
    const totalPages = Math.ceil(imgHeight / availableHeight);
    
    console.log(`PDF Export - Creating ${totalPages} page(s)`);
    
    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set PDF metadata
    pdf.setProperties({
      title: `HireScribe Assessment: ${filename}`,
      author: 'HireScribe Assessment Platform',
      subject: 'Candidate Assessment Report',
      keywords: 'assessment, candidate, hirescribe, report',
      creator: 'HireScribe'
    });
    
    // Handle single-page vs multi-page content
    if (imgHeight <= availableHeight) {
      // Content fits on a single page
      addPageContent(pdf, imgData, margin, contentTop, availableWidth, imgHeight, 1, totalPages, headerHeight, footerHeight, pageHeight, pageWidth);
    } else {
      // Content spans multiple pages
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate the portion of the image to use for this page
        const sourceY = (i * availableHeight / imgHeight) * canvas.height;
        const sourceHeight = (availableHeight / imgHeight) * canvas.height;
        
        // Create a temporary canvas for this page section
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        
        const pageContext = pageCanvas.getContext('2d');
        if (pageContext) {
          pageContext.drawImage(
            canvas, 
            0, sourceY, canvas.width, sourceHeight, 
            0, 0, pageCanvas.width, pageCanvas.height
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png');
          
          // Add this page section to the PDF
          addPageContent(
            pdf, 
            pageImgData, 
            margin, 
            contentTop, 
            availableWidth, 
            availableHeight,
            i + 1,
            totalPages,
            headerHeight, 
            footerHeight, 
            pageHeight, 
            pageWidth
          );
        }
      }
    }
    
    console.log(`PDF Export - Saving PDF as ${filename}.pdf`);
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};

// Helper function to add content to a PDF page with headers and footers
const addPageContent = (
  pdf: any,
  imgData: string,
  margin: number,
  contentTop: number,
  contentWidth: number,
  contentHeight: number,
  pageNumber: number,
  totalPages: number,
  headerHeight: number,
  footerHeight: number,
  pageHeight: number,
  pageWidth: number
) => {
  // Add header with branding
  pdf.setFillColor(248, 250, 252); // Light background
  pdf.rect(0, 0, pageWidth, headerHeight, 'F');
  
  // Add subtle header border
  pdf.setDrawColor(230, 236, 241);
  pdf.setLineWidth(0.5);
  pdf.line(margin, headerHeight, pageWidth - margin, headerHeight);
  
  // Add logo/branding text
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(79, 70, 229); // hirescribe-primary
  pdf.setFontSize(16);
  pdf.text('HireScribe', margin, 12);
  
  // Add report title
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(45, 55, 72);
  pdf.setFontSize(12);
  pdf.text('Assessment Report', margin, 20);
  
  // Add date on the right side
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Generated: ${date}`, pageWidth - 60, 12);
  pdf.text('CONFIDENTIAL', pageWidth - 60, 20);

  // Add the image content (centered horizontally)
  const xOffset = margin + (contentWidth - contentWidth) / 2;
  pdf.addImage(
    imgData,
    'PNG',
    xOffset,
    contentTop,
    contentWidth,
    contentHeight
  );
  
  // Add footer with branding
  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
  
  // Add subtle footer border
  pdf.setDrawColor(230, 236, 241);
  pdf.setLineWidth(0.5);
  pdf.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
  
  // Add footer text
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('© HireScribe Assessment Platform', margin, pageHeight - 12);
  
  // Add page number
  pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 30, pageHeight - 12);
  
  // Add disclaimer
  pdf.setFontSize(6);
  pdf.text('This report is confidential and intended only for authorized recipients.', margin, pageHeight - 6);
};
