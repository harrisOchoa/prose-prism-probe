
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

    // Use a higher scale for better quality
    const scale = 2;

    // Create a wrapper div with portrait optimized width
    const wrapper = document.createElement('div');
    wrapper.style.width = '800px'; // Optimized for portrait A4
    wrapper.style.margin = '0 auto';
    wrapper.classList.add('pdf-wrapper');

    // Clone the element for PDF generation
    const clone = element.cloneNode(true) as HTMLElement;
    wrapper.appendChild(clone);
    
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    document.body.appendChild(wrapper);

    // Portrait-specific styles
    clone.classList.add('pdf-layout-portrait');
    clone.style.padding = '10px';

    const canvas = await html2canvas(wrapper, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      ignoreElements: (element) => {
        return element.classList.contains('pdf-hide') ||
               element.classList.contains('hidden-for-pdf');
      }
    });
    
    document.body.removeChild(wrapper);

    // Restore DOM
    document.querySelectorAll('.hidden-for-pdf').forEach((el) => {
      el.classList.remove('hidden-for-pdf');
    });

    document.querySelectorAll('.visible-for-pdf').forEach((el) => {
      el.classList.remove('visible-for-pdf');
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate aspect ratio
    const aspectRatio = canvas.width / canvas.height;
    
    // PDF size (A4 portrait)
    const pageWidth = 210;  // A4 portrait width in mm
    const pageHeight = 297; // A4 portrait height in mm

    // Margins and spacing
    const margin = 10;
    const headerHeight = 20;
    const footerHeight = 15;
    
    // Content area
    const contentTop = headerHeight + margin;
    const contentBottom = pageHeight - footerHeight - margin;
    const availableHeight = contentBottom - contentTop;
    const availableWidth = pageWidth - (margin * 2);
    
    // Calculate image dimensions maintaining aspect ratio
    let imgWidth = availableWidth;
    let imgHeight = imgWidth / aspectRatio;
    
    if (imgHeight > availableHeight) {
      imgHeight = availableHeight;
      imgWidth = imgHeight * aspectRatio;
    }
    
    // Center the image horizontally
    const xOffset = margin + (availableWidth - imgWidth) / 2;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, pageWidth, headerHeight, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(45, 55, 72);
    pdf.setFontSize(12);
    pdf.text('Assessment Report', margin, 14);

    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Generated: ${date}`, pageWidth - 60, 14);

    // Add the image content
    pdf.addImage(
      imgData,
      'PNG',
      xOffset,
      contentTop,
      imgWidth,
      imgHeight
    );

    // Footer
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.text('HireScribe Assessment Platform', margin, pageHeight - 6);
    pdf.text('Page 1 of 1', pageWidth - 30, pageHeight - 6);

    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};
