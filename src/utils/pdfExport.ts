
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
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      ignoreElements: (element) => {
        return element.classList.contains('pdf-hide') || 
               element.classList.contains('hidden-for-pdf');
      }
    });
    
    // Restore the DOM after capturing
    document.querySelectorAll('.hidden-for-pdf').forEach((el) => {
      el.classList.remove('hidden-for-pdf');
    });
    
    document.querySelectorAll('.visible-for-pdf').forEach((el) => {
      el.classList.remove('visible-for-pdf');
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = 297; 
    const pageHeight = 210;
    
    const imgWidth = pageWidth - 20; // 10mm margins on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, pageWidth, 15, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(45, 55, 72);
    pdf.setFontSize(14);
    pdf.text('Candidate Assessment Report', 10, 10);
    
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Generated on ${formattedDate}`, pageWidth - 70, 10);
    
    const yPosition = 20;
    
    pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
    
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.text('HireScribe Assessment Platform', 10, pageHeight - 5);
    pdf.text('Page 1 of 1', pageWidth - 30, pageHeight - 5);
    
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};
