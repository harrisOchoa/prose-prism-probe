
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPdf = async (elementId: string, filename: string) => {
  try {
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

    // Use a higher scale for better quality, but detect mobile and adjust if needed
    const isMobile = window.innerWidth < 768;
    const scale = isMobile ? 1.5 : 2;

    // Create a wrapper div to control width more precisely
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '1100px'; // More optimal width for landscape mode
    wrapper.style.margin = '0 auto';
    wrapper.classList.add('pdf-wrapper');

    // Clone the element for PDF generation to avoid modifying the original DOM
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Add clone to wrapper
    wrapper.appendChild(clone);
    
    // Add wrapper to DOM temporarily with absolute positioning off-screen
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    document.body.appendChild(wrapper);
    
    // Add special layout class to the clone
    clone.classList.add('pdf-layout-landscape');
    
    // Apply better margins for landscape mode
    clone.style.padding = '0 5px';

    const canvas = await html2canvas(wrapper, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      ignoreElements: (element) => {
        return element.classList.contains('pdf-hide') ||
               element.classList.contains('hidden-for-pdf');
      },
      // Adjust canvas rendering
      onclone: (document) => {
        const clonedWrapper = document.querySelector('.pdf-wrapper');
        if (clonedWrapper) {
          // Enhance layout for landscape mode
          const cards = clonedWrapper.querySelectorAll('.card, .assessment-card');
          cards.forEach(card => {
            (card as HTMLElement).style.marginBottom = '12px';
          });
          
          // Optimize progress bars
          const progressBars = clonedWrapper.querySelectorAll('.progress');
          progressBars.forEach(bar => {
            (bar as HTMLElement).style.height = '8px';
          });
        }
      }
    });
    
    // Remove the wrapper from DOM
    document.body.removeChild(wrapper);

    // Restore the DOM after capturing
    document.querySelectorAll('.hidden-for-pdf').forEach((el) => {
      el.classList.remove('hidden-for-pdf');
    });

    document.querySelectorAll('.visible-for-pdf').forEach((el) => {
      el.classList.remove('visible-for-pdf');
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate aspect ratio
    const aspectRatio = canvas.width / canvas.height;
    
    // PDF size (A4 landscape)
    const pageWidth = 297;  // A4 landscape width in mm
    const pageHeight = 210; // A4 landscape height in mm

    // Reduced margins to utilize more space
    const margin = 8;
    
    // Header/Footer sizes and spacing management with reduced heights
    const headerHeight = 16;
    const footerHeight = 12;
    const contentTop = headerHeight + margin;
    const contentBottom = pageHeight - footerHeight - margin;
    const availableHeight = contentBottom - contentTop;
    
    // Calculate dimensions with wider usable area
    const availableWidth = pageWidth - (margin * 2);
    
    // Calculate image dimensions to maintain aspect ratio
    let imgWidth = availableWidth;
    let imgHeight = imgWidth / aspectRatio;
    
    // If the height exceeds available space, scale down based on height
    if (imgHeight > availableHeight) {
      imgHeight = availableHeight;
      imgWidth = imgHeight * aspectRatio;
    }
    
    // Center the image horizontally
    const xOffset = margin + (availableWidth - imgWidth) / 2;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Header background bar
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, pageWidth, headerHeight, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(45, 55, 72);
    pdf.setFontSize(14);
    pdf.text('Candidate Assessment Report', margin, 11);

    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Generated on ${formattedDate}`, pageWidth - 70, 11);

    // Draw image content with reduced margins
    pdf.addImage(
      imgData,
      'PNG',
      xOffset,
      contentTop,
      imgWidth,
      imgHeight
    );

    // Footer with padding above to prevent overlap
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.text('HireScribe Assessment Platform', margin, pageHeight - 5);
    pdf.text('Page 1 of 1', pageWidth - 30, pageHeight - 5);

    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};
