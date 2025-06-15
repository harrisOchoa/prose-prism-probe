
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { logger } from '@/services/logging';

// Enhanced PDF export with professional formatting
export const exportToPdf = async (elementId: string, filename: string) => {
  try {
    logger.info('PDF_EXPORT', 'Starting PDF export', { elementId, filename });
    
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
      // Also force active state for any tab panels
      if (el.getAttribute('role') === 'tabpanel') {
        el.setAttribute('data-state', 'active');
      }
    });
    
    // Force show all elements with visible-for-pdf class
    document.querySelectorAll('.visible-for-pdf').forEach(el => {
      (el as HTMLElement).style.display = 'block';
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.visibility = 'visible';
      (el as HTMLElement).style.height = 'auto';
      (el as HTMLElement).style.overflow = 'visible';
      
      // Force active state for tabpanels
      if (el.getAttribute('role') === 'tabpanel') {
        el.setAttribute('data-state', 'active');
      }
    });
    
    // Hide tab lists and keep only content
    document.querySelectorAll('[role="tablist"]').forEach(el => {
      el.classList.add('hidden-for-pdf');
    });
    
    // Process pdf-section-container elements to ensure they start on new pages
    document.querySelectorAll('.pdf-section-container').forEach((section, index) => {
      (section as HTMLElement).style.pageBreakBefore = 'always';
      (section as HTMLElement).style.breakBefore = 'page';
      
      // Add index attribute to help identify sections
      section.setAttribute('data-pdf-section-index', index.toString());
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
    
    // Force all tabpanels in the clone to be active and visible
    clone.querySelectorAll('[role="tabpanel"]').forEach(panel => {
      panel.setAttribute('data-state', 'active');
      (panel as HTMLElement).style.display = 'block';
      (panel as HTMLElement).style.opacity = '1';
      (panel as HTMLElement).style.visibility = 'visible';
      (panel as HTMLElement).style.height = 'auto';
      (panel as HTMLElement).style.overflow = 'visible';
      (panel as HTMLElement).style.position = 'static';
    });

    // Process pdf-section-container elements in the clone
    clone.querySelectorAll('.pdf-section-container').forEach((section, index) => {
      (section as HTMLElement).style.pageBreakBefore = 'always';
      (section as HTMLElement).style.breakBefore = 'page';
    });

    // Log what we're capturing
    logger.debug('PDF_EXPORT', 'Content prepared, capturing with html2canvas', {
      elementsInClone: clone.querySelectorAll('*').length,
      visibleTabpanels: clone.querySelectorAll('[role="tabpanel"]:not([style*="display: none"])').length,
      sectionContainers: clone.querySelectorAll('.pdf-section-container').length
    });
    
    // Create canvas from the wrapper with high resolution
    const canvas = await html2canvas(wrapper, {
      scale: scale,
      useCORS: true,
      logging: false, // Disable html2canvas logging
      backgroundColor: '#ffffff',
      ignoreElements: (element) => {
        // Don't ignore elements marked as visible for PDF
        if (element.classList && (
            element.classList.contains('pdf-show') || 
            element.classList.contains('visible-for-pdf') ||
            element.classList.contains('pdf-section-container') ||
            element.classList.contains('pdf-section-divider')
        )) {
          return false;
        }
        
        // Hide elements marked as hidden for PDF
        if (element.classList && element.classList.contains('hidden-for-pdf')) {
          return true;
        }
        
        // Handle tab panels specially
        if (element.hasAttribute('role') && element.getAttribute('role') === 'tabpanel') {
          // Include all tab panels in the pdf-content container
          const isInsidePdfContent = !!element.closest('.pdf-content, .visible-for-pdf, .pdf-show, .pdf-section-container');
          
          if (isInsidePdfContent) {
            return false;
          }
        }
        
        // Handle tab lists - always hide them
        if (element.hasAttribute('role') && element.getAttribute('role') === 'tablist') {
          return true;
        }
        
        // Default case - don't ignore
        return false;
      }
    });
    
    logger.info('PDF_EXPORT', 'Canvas generated', { 
      canvasWidth: canvas.width, 
      canvasHeight: canvas.height 
    });
    
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
    // Count the number of section containers plus 2 for cover page and TOC
    const numSectionContainers = document.querySelectorAll('.pdf-section-container').length;
    const totalPages = Math.max(Math.ceil(imgHeight / availableHeight), numSectionContainers + 2);
    
    logger.info('PDF_EXPORT', 'Creating PDF', { totalPages });
    
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
    
    // Handle multi-page content
    const pageCount = Math.ceil(imgHeight / availableHeight);
    
    // Find section dividers in the canvas to determine page breaks
    const sectionBreaks = [];
    const sectionContainers = document.querySelectorAll('.pdf-section-container');
    
    if (sectionContainers.length > 0) {
      // Let's use the number of sections to determine page count
      // Plus 2 for cover page and table of contents
      const sectionPageCount = sectionContainers.length + 2;
      
      // Divide the canvas height into that many equal parts
      const sectionHeight = canvas.height / sectionPageCount;
      
      // Create page breaks at each section boundary
      for (let i = 1; i <= sectionPageCount; i++) {
        sectionBreaks.push(i * sectionHeight);
      }
    }
    
    // Use section breaks if available, otherwise do auto pagination
    if (sectionBreaks.length > 0) {
      // Use pre-defined section breaks
      for (let i = 0; i < sectionBreaks.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate the portion of the image to use for this page
        const startY = i === 0 ? 0 : sectionBreaks[i - 1];
        const endY = sectionBreaks[i];
        const sourceHeight = endY - startY;
        
        // Create a temporary canvas for this page section
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        
        const pageContext = pageCanvas.getContext('2d');
        if (pageContext) {
          pageContext.drawImage(
            canvas, 
            0, startY, canvas.width, sourceHeight, 
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
            Math.min(sourceHeight / scale, availableHeight),
            i + 1,
            sectionBreaks.length,
            headerHeight, 
            footerHeight, 
            pageHeight, 
            pageWidth
          );
        }
      }
    } else {
      // Use automatic pagination based on available height
      for (let i = 0; i < pageCount; i++) {
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
            pageCount,
            headerHeight, 
            footerHeight, 
            pageHeight, 
            pageWidth
          );
        }
      }
    }
    
    logger.info('PDF_EXPORT', 'PDF export completed successfully', { filename: `${filename}.pdf` });
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    logger.error('PDF_EXPORT', 'PDF export failed', error);
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
