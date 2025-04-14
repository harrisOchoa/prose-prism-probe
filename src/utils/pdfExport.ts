
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AssessmentData } from '@/hooks/useAssessmentView';

export const exportToPdf = async (elementId: string, filename: string, assessment: AssessmentData) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Use landscape orientation for all pages
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // A4 dimensions in landscape (width: 297mm, height: 210mm)
    const pageWidth = 297; 
    const pageHeight = 210;
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);
    
    // Common header function
    const addHeader = (title: string, pageNum: number, totalPages: number) => {
      pdf.setFillColor(248, 250, 252); // Light gray background
      pdf.rect(0, 0, pageWidth, 15, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(45, 55, 72); // Dark gray text
      pdf.setFontSize(14);
      pdf.text(`${assessment.candidateName} - ${title}`, margin, 10);
      
      // Add position and date
      const date = new Date();
      const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139); // Slate gray
      pdf.text(`Position: ${assessment.candidatePosition}`, margin, pageHeight - 5);
      pdf.text(`Generated: ${formattedDate}`, pageWidth - 70, 10);
      pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 30, pageHeight - 5);
    };

    // Add footer function
    const addFooter = () => {
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175); // Gray text
      pdf.text('HireScribe Assessment Platform', margin, pageHeight - 5);
    };

    // Function to capture and process tabs
    const captureTab = async (tabSelector: string) => {
      const tabElement = document.querySelector(tabSelector);
      if (!tabElement) return null;
      
      return await html2canvas(tabElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
    };

    // Get the number of pages to generate
    let totalPages = 1; // Overview page is always included
    
    // Add additional pages based on available analysis
    if (assessment.detailedWritingAnalysis) totalPages++;
    if (assessment.personalityInsights) totalPages++;
    if (assessment.profileMatch) totalPages++;

    // Page 1: Overview Tab
    const overviewTab = await captureTab('[data-value="overview"]');
    if (overviewTab) {
      addHeader("Assessment Overview", 1, totalPages);
      
      const imgRatio = overviewTab.height / overviewTab.width;
      const imgWidth = contentWidth;
      const imgHeight = imgWidth * imgRatio;
      
      pdf.addImage(
        overviewTab.toDataURL('image/png'),
        'PNG',
        margin,
        20,
        imgWidth,
        Math.min(imgHeight, contentHeight - 30) // Ensure it fits on page
      );
      
      addFooter();
    }
    
    // Page 2: Writing Analysis (if available)
    if (assessment.detailedWritingAnalysis) {
      // Switch to detailed writing analysis tab
      const writingAnalysisTab = document.querySelector('[data-tab="writing-analysis"]');
      if (writingAnalysisTab) {
        (writingAnalysisTab as HTMLElement).click();
        
        // Wait a moment for the UI to update
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const writingAnalysisCanvas = await captureTab('.writing-analysis-content');
        if (writingAnalysisCanvas) {
          pdf.addPage();
          addHeader("Writing Analysis", 2, totalPages);
          
          const imgRatio = writingAnalysisCanvas.height / writingAnalysisCanvas.width;
          const imgWidth = contentWidth;
          const imgHeight = imgWidth * imgRatio;
          
          pdf.addImage(
            writingAnalysisCanvas.toDataURL('image/png'),
            'PNG',
            margin,
            20,
            imgWidth,
            Math.min(imgHeight, contentHeight - 30)
          );
          
          addFooter();
        }
      }
    }
    
    // Page 3: Personality Insights (if available)
    if (assessment.personalityInsights) {
      // Switch to personality insights tab
      const personalityTab = document.querySelector('[data-tab="personality"]');
      if (personalityTab) {
        (personalityTab as HTMLElement).click();
        
        // Wait a moment for the UI to update
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const personalityCanvas = await captureTab('.personality-content');
        if (personalityCanvas) {
          pdf.addPage();
          const pageNum = assessment.detailedWritingAnalysis ? 3 : 2;
          addHeader("Personality Insights", pageNum, totalPages);
          
          const imgRatio = personalityCanvas.height / personalityCanvas.width;
          const imgWidth = contentWidth;
          const imgHeight = imgWidth * imgRatio;
          
          pdf.addImage(
            personalityCanvas.toDataURL('image/png'),
            'PNG',
            margin,
            20,
            imgWidth,
            Math.min(imgHeight, contentHeight - 30)
          );
          
          addFooter();
        }
      }
    }
    
    // Page 4: Profile Match (if available)
    if (assessment.profileMatch) {
      // Switch to profile match tab
      const profileTab = document.querySelector('[data-tab="profile"]');
      if (profileTab) {
        (profileTab as HTMLElement).click();
        
        // Wait a moment for the UI to update
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const profileCanvas = await captureTab('.profile-match-content');
        if (profileCanvas) {
          pdf.addPage();
          let pageNum = 2;
          if (assessment.detailedWritingAnalysis) pageNum++;
          if (assessment.personalityInsights) pageNum++;
          
          addHeader("Profile Match", pageNum, totalPages);
          
          const imgRatio = profileCanvas.height / profileCanvas.width;
          const imgWidth = contentWidth;
          const imgHeight = imgWidth * imgRatio;
          
          pdf.addImage(
            profileCanvas.toDataURL('image/png'),
            'PNG',
            margin,
            20,
            imgWidth,
            Math.min(imgHeight, contentHeight - 30)
          );
          
          addFooter();
        }
      }
    }
    
    // Return to the first tab (overview)
    const overviewTabElem = document.querySelector('[data-tab="overview"]');
    if (overviewTabElem) {
      (overviewTabElem as HTMLElement).click();
    }
    
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};
