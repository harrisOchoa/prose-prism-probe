
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AssessmentData } from '@/hooks/useAssessmentView';
import { toast } from '@/hooks/use-toast';

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

    // Function to safely capture and process tabs
    const captureTab = async (tabSelector: string) => {
      try {
        const tabElement = document.querySelector(tabSelector);
        if (!tabElement) {
          console.warn(`Tab element not found: ${tabSelector}`);
          return null;
        }
        
        // Enhanced canvas options to improve reliability
        return await html2canvas(tabElement as HTMLElement, {
          scale: 1.5, // Reduced from 2 to potentially avoid memory issues
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true, // Allow cross-origin images
          removeContainer: true, // Clean up after rendering
          imageTimeout: 15000, // Increased timeout for image loading
          onclone: (document) => {
            // Additional cleanup in cloned document before rendering
            const clonedElement = document.querySelector(tabSelector);
            if (clonedElement) {
              // Remove any potentially problematic elements
              const imgs = clonedElement.querySelectorAll('img[src=""]');
              imgs.forEach(img => img.remove());
            }
          }
        });
      } catch (error) {
        console.error(`Error capturing tab ${tabSelector}:`, error);
        return null;
      }
    };

    // Safely add image to PDF
    const safelyAddImage = (canvas: HTMLCanvasElement, pageIndex: number, title: string, totalPages: number) => {
      try {
        if (pageIndex > 0) {
          pdf.addPage();
        }
        
        addHeader(title, pageIndex + 1, totalPages);
        
        const imgRatio = canvas.height / canvas.width;
        const imgWidth = contentWidth;
        const imgHeight = imgWidth * imgRatio;
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95); // Use JPEG instead of PNG for better compatibility
        
        pdf.addImage(
          dataUrl,
          'JPEG',
          margin,
          20,
          imgWidth,
          Math.min(imgHeight, contentHeight - 30)
        );
        
        addFooter();
        return true;
      } catch (error) {
        console.error('Error adding image to PDF:', error);
        return false;
      }
    };

    // Get the number of pages to generate
    let totalPages = 1; // Overview page is always included
    
    // Add additional pages based on available analysis
    if (assessment.detailedWritingAnalysis) totalPages++;
    if (assessment.personalityInsights) totalPages++;
    if (assessment.profileMatch) totalPages++;

    let pageSuccess = true;

    // Page 1: Overview Tab
    const overviewTab = await captureTab('[data-value="overview"]');
    if (overviewTab) {
      pageSuccess = safelyAddImage(overviewTab, 0, "Assessment Overview", totalPages);
    } else {
      console.error("Failed to capture overview tab");
      pageSuccess = false;
    }
    
    let currentPage = 1;
    
    // Page 2: Writing Analysis (if available)
    if (pageSuccess && assessment.detailedWritingAnalysis) {
      // Switch to detailed writing analysis tab
      const writingAnalysisTab = document.querySelector('[data-tab="writing-analysis"]');
      if (writingAnalysisTab) {
        (writingAnalysisTab as HTMLElement).click();
        
        // Wait a moment for the UI to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const writingAnalysisCanvas = await captureTab('.writing-analysis-content');
        if (writingAnalysisCanvas) {
          pageSuccess = safelyAddImage(writingAnalysisCanvas, currentPage, "Writing Analysis", totalPages);
          currentPage++;
        } else {
          console.error("Failed to capture writing analysis tab");
        }
      }
    }
    
    // Page 3: Personality Insights (if available)
    if (pageSuccess && assessment.personalityInsights) {
      // Switch to personality insights tab
      const personalityTab = document.querySelector('[data-tab="personality"]');
      if (personalityTab) {
        (personalityTab as HTMLElement).click();
        
        // Wait a moment for the UI to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const personalityCanvas = await captureTab('.personality-content');
        if (personalityCanvas) {
          pageSuccess = safelyAddImage(personalityCanvas, currentPage, "Personality Insights", totalPages);
          currentPage++;
        } else {
          console.error("Failed to capture personality tab");
        }
      }
    }
    
    // Page 4: Profile Match (if available)
    if (pageSuccess && assessment.profileMatch) {
      // Switch to profile match tab
      const profileTab = document.querySelector('[data-tab="profile"]');
      if (profileTab) {
        (profileTab as HTMLElement).click();
        
        // Wait a moment for the UI to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const profileCanvas = await captureTab('.profile-match-content');
        if (profileCanvas) {
          pageSuccess = safelyAddImage(profileCanvas, currentPage, "Profile Match", totalPages);
        } else {
          console.error("Failed to capture profile match tab");
        }
      }
    }
    
    // Return to the first tab (overview)
    const overviewTabElem = document.querySelector('[data-tab="overview"]');
    if (overviewTabElem) {
      (overviewTabElem as HTMLElement).click();
    }
    
    if (pageSuccess) {
      pdf.save(`${filename}.pdf`);
      return true;
    } else {
      throw new Error("Failed to generate PDF content properly");
    }
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};
