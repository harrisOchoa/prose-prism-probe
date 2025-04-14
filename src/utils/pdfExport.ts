
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
        
        console.log(`Capturing tab: ${tabSelector}`);
        
        // Enhanced canvas options to improve reliability
        return await html2canvas(tabElement as HTMLElement, {
          scale: 1.2, // Lower scale to avoid memory issues
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

    // Safely add image to PDF with proper error handling
    const safelyAddImage = (canvas: HTMLCanvasElement, pageIndex: number, title: string, totalPages: number) => {
      try {
        if (pageIndex > 0) {
          pdf.addPage();
        }
        
        addHeader(title, pageIndex + 1, totalPages);
        
        // Calculate image dimensions while preserving aspect ratio
        const imgRatio = canvas.height / canvas.width;
        const imgWidth = contentWidth;
        const imgHeight = imgWidth * imgRatio;
        
        // Use JPEG format for better compatibility
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Add image to PDF
        pdf.addImage(
          dataUrl,
          'JPEG',
          margin,
          20, // Top margin after header
          imgWidth,
          Math.min(imgHeight, contentHeight - 30) // Limit height to fit on page
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
    
    // Store the currently active tab to restore it later
    const activeTabElement = document.querySelector('[data-tab].active') || 
                            document.querySelector('[data-state="active"][data-tab]');
    const activeTabId = activeTabElement ? (activeTabElement as HTMLElement).getAttribute('data-tab') : 'overview';

    console.log("PDF Export: Starting export process");
    console.log("PDF Export: Total pages to generate:", totalPages);
    console.log("PDF Export: Current active tab:", activeTabId);

    // Page 1: Overview Tab
    const overviewTabTrigger = document.querySelector('[data-tab="overview"]');
    if (overviewTabTrigger) {
      console.log("PDF Export: Switching to overview tab");
      (overviewTabTrigger as HTMLElement).click();
      // Give the UI time to update
      await new Promise(resolve => setTimeout(resolve, 800)); // Increased wait time
    }
    
    const overviewTab = await captureTab('[data-value="overview"]');
    if (overviewTab) {
      console.log("PDF Export: Successfully captured overview tab");
      pageSuccess = safelyAddImage(overviewTab, 0, "Assessment Overview", totalPages);
    } else {
      console.error("PDF Export: Failed to capture overview tab");
      pageSuccess = false;
    }
    
    let currentPage = 1;
    
    // Page 2: Writing Analysis (if available)
    if (pageSuccess && assessment.detailedWritingAnalysis) {
      // Switch to advanced tab first
      const advancedTabTrigger = document.querySelector('[data-tab="advanced"]');
      if (advancedTabTrigger) {
        console.log("PDF Export: Switching to advanced tab");
        (advancedTabTrigger as HTMLElement).click();
        
        // Wait longer for the tab to update
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Now switch to writing analysis tab
        const writingAnalysisTab = document.querySelector('[data-tab="writing-analysis"]');
        if (writingAnalysisTab) {
          console.log("PDF Export: Switching to writing analysis subtab");
          (writingAnalysisTab as HTMLElement).click();
          
          // Wait longer for the UI to update
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const writingAnalysisCanvas = await captureTab('.writing-analysis-content');
          if (writingAnalysisCanvas) {
            console.log("PDF Export: Successfully captured writing analysis tab");
            pageSuccess = safelyAddImage(writingAnalysisCanvas, currentPage, "Writing Analysis", totalPages);
            currentPage++;
          } else {
            console.error("PDF Export: Failed to capture writing analysis tab");
          }
        }
      }
    }
    
    // Page 3: Personality Insights (if available)
    if (pageSuccess && assessment.personalityInsights) {
      // Advanced tab should already be active from previous step
      // Switch to personality insights tab
      const personalityTab = document.querySelector('[data-tab="personality"]');
      if (personalityTab) {
        console.log("PDF Export: Switching to personality tab");
        (personalityTab as HTMLElement).click();
        
        // Wait longer for the UI to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const personalityCanvas = await captureTab('.personality-content');
        if (personalityCanvas) {
          console.log("PDF Export: Successfully captured personality tab");
          pageSuccess = safelyAddImage(personalityCanvas, currentPage, "Personality Insights", totalPages);
          currentPage++;
        } else {
          console.error("PDF Export: Failed to capture personality tab");
        }
      }
    }
    
    // Page 4: Profile Match (if available)
    if (pageSuccess && assessment.profileMatch) {
      // Advanced tab should already be active from previous steps
      // Switch to profile match tab
      const profileTab = document.querySelector('[data-tab="profile"]');
      if (profileTab) {
        console.log("PDF Export: Switching to profile match tab");
        (profileTab as HTMLElement).click();
        
        // Wait longer for the UI to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const profileCanvas = await captureTab('.profile-match-content');
        if (profileCanvas) {
          console.log("PDF Export: Successfully captured profile match tab");
          pageSuccess = safelyAddImage(profileCanvas, currentPage, "Profile Match", totalPages);
        } else {
          console.error("PDF Export: Failed to capture profile match tab");
        }
      }
    }
    
    // Return to the original active tab
    console.log("PDF Export: Restoring original tab:", activeTabId);
    const originalTabElem = document.querySelector(`[data-tab="${activeTabId}"]`);
    if (originalTabElem) {
      (originalTabElem as HTMLElement).click();
    }
    
    if (pageSuccess) {
      console.log("PDF Export: Successfully generated PDF with", totalPages, "pages");
      pdf.save(`${filename}.pdf`);
      return true;
    } else {
      console.error("PDF Export: Failed to generate PDF content properly");
      throw new Error("Failed to generate PDF content properly");
    }
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};
