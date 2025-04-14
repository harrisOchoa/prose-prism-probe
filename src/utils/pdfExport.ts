
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPdf = async (elementId: string, filename: string) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape', // Using landscape orientation
      unit: 'mm',
      format: 'a4'
    });
    
    // A4 dimensions in landscape (width: 297mm, height: 210mm)
    const pageWidth = 297; 
    const pageHeight = 210;
    
    // Calculate dimensions while maintaining aspect ratio
    const imgWidth = pageWidth - 20; // 10mm margins on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add a header with the candidate name
    pdf.setFillColor(248, 250, 252); // Light gray background
    pdf.rect(0, 0, pageWidth, 15, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(45, 55, 72); // Dark gray text
    pdf.setFontSize(14);
    pdf.text(`Candidate Assessment Report`, 10, 10);
    
    // Add current date
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139); // Slate gray
    pdf.text(`Generated on ${formattedDate}`, pageWidth - 70, 10);
    
    // Position the content after the header
    const yPosition = 20;
    
    // Add the content - ensuring we only use one page
    pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
    
    // Add footer with company info
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175); // Gray text
    pdf.text('HireScribe Assessment Platform', 10, pageHeight - 5);
    pdf.text('Page 1 of 1', pageWidth - 30, pageHeight - 5);
    
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};
