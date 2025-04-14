
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AssessmentData } from '@/hooks/useAssessmentView';
import { toast } from '@/hooks/use-toast';

export const exportToPdf = async (elementId: string, filename: string, assessment: AssessmentData) => {
  try {
    console.log("PDF Export: Starting export process with assessment data:", assessment.candidateName);
    
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

    // Create an array of tab configurations to process
    const tabsToProcess = [
      { id: "overview", selector: '[data-value="overview"]', title: "Assessment Overview" },
    ];
    
    // Add additional tabs based on what data is available
    if (assessment.detailedWritingAnalysis) {
      tabsToProcess.push({ 
        id: "writing-analysis", 
        selector: '.writing-analysis-content', 
        title: "Writing Analysis",
        parent: "advanced"
      });
    }
    
    if (assessment.personalityInsights) {
      tabsToProcess.push({ 
        id: "personality", 
        selector: '.personality-content', 
        title: "Personality Insights",
        parent: "advanced"
      });
    }
    
    if (assessment.profileMatch) {
      tabsToProcess.push({ 
        id: "profile", 
        selector: '.profile-match-content', 
        title: "Profile Match",
        parent: "advanced"
      });
    }
    
    // Store the currently active tab to restore it later
    const activeTabElement = document.querySelector('[data-tab].active') || 
                            document.querySelector('[data-state="active"][data-tab]');
    const activeTabId = activeTabElement ? (activeTabElement as HTMLElement).getAttribute('data-tab') : 'overview';
    console.log("PDF Export: Current active tab:", activeTabId);
    
    // Calculate total pages
    const totalPages = tabsToProcess.length;
    console.log("PDF Export: Total pages to generate:", totalPages);
    
    // Function to wait for DOM updates
    const waitForDomUpdate = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Function to activate a tab
    const activateTab = async (tabId: string, parentTabId?: string) => {
      console.log(`PDF Export: Activating tab ${tabId}${parentTabId ? ` (parent: ${parentTabId})` : ''}`);
      
      // If there's a parent tab, activate it first
      if (parentTabId) {
        const parentTabTrigger = document.querySelector(`[data-tab="${parentTabId}"]`);
        if (parentTabTrigger) {
          (parentTabTrigger as HTMLElement).click();
          await waitForDomUpdate();
        } else {
          console.warn(`PDF Export: Parent tab ${parentTabId} not found`);
        }
      }
      
      // Now activate the actual tab
      const tabTrigger = document.querySelector(`[data-tab="${tabId}"]`);
      if (tabTrigger) {
        (tabTrigger as HTMLElement).click();
        await waitForDomUpdate();
        return true;
      } else {
        console.warn(`PDF Export: Tab ${tabId} not found`);
        return false;
      }
    };
    
    // Function to capture a tab content with better reliability
    const captureTabContent = async (selector: string): Promise<HTMLCanvasElement | null> => {
      const element = document.querySelector(selector);
      if (!element) {
        console.error(`PDF Export: Element not found with selector: ${selector}`);
        return null;
      }
      
      try {
        // Hide elements that shouldn't be in the PDF
        document.querySelectorAll('.pdf-hide').forEach(el => {
          el.classList.add('hidden-for-pdf');
        });
        
        // Show elements that should only be in the PDF
        document.querySelectorAll('.pdf-show').forEach(el => {
          el.classList.add('visible-for-pdf');
        });
        
        // Wait for DOM updates
        await waitForDomUpdate(500);
        
        // Improved canvas options
        const canvas = await html2canvas(element as HTMLElement, {
          scale: 1, // Use a lower scale to avoid memory issues
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          imageTimeout: 15000,
          onclone: (clonedDoc) => {
            // Clean up the cloned document
            const clonedElement = clonedDoc.querySelector(selector);
            if (clonedElement) {
              // Remove problematic elements
              clonedElement.querySelectorAll('img[src=""]').forEach(img => img.remove());
              
              // Set fixed width for content to avoid stretching
              (clonedElement as HTMLElement).style.width = '1000px';
              (clonedElement as HTMLElement).style.maxWidth = '1000px';
            }
          }
        });
        
        return canvas;
      } catch (error) {
        console.error(`PDF Export: Error capturing content for ${selector}:`, error);
        return null;
      } finally {
        // Restore the DOM
        document.querySelectorAll('.hidden-for-pdf').forEach(el => {
          el.classList.remove('hidden-for-pdf');
        });
        
        document.querySelectorAll('.visible-for-pdf').forEach(el => {
          el.classList.remove('visible-for-pdf');
        });
      }
    };
    
    // Process each tab and add to PDF
    for (let i = 0; i < tabsToProcess.length; i++) {
      const tab = tabsToProcess[i];
      console.log(`PDF Export: Processing tab ${i+1}/${tabsToProcess.length}: ${tab.id}`);
      
      // Activate the tab
      const activated = await activateTab(tab.id, tab.parent);
      if (!activated) {
        console.error(`PDF Export: Could not activate tab ${tab.id}`);
        continue;
      }
      
      // Wait a bit longer for complex tabs
      await waitForDomUpdate(tab.parent ? 1500 : 1000);
      
      // Capture the content
      const canvas = await captureTabContent(tab.selector);
      if (!canvas) {
        console.error(`PDF Export: Failed to capture content for tab ${tab.id}`);
        continue;
      }
      
      // Add a new page for each tab except the first one
      if (i > 0) {
        pdf.addPage();
      }
      
      // Add header
      addHeader(tab.title, i + 1, totalPages);
      
      // Calculate image dimensions preserving aspect ratio
      const aspectRatio = canvas.height / canvas.width;
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = imgWidth * aspectRatio;
      
      // Avoid stretching by limiting height if needed
      const maxImgHeight = pageHeight - (margin * 2) - 20; // Leave space for header/footer
      const finalImgHeight = Math.min(imgHeight, maxImgHeight);
      
      // Add image
      try {
        console.log(`PDF Export: Adding image for ${tab.id}, dimensions: ${imgWidth}x${finalImgHeight}`);
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.9),
          'JPEG',
          margin,
          20, // Top margin after header
          imgWidth,
          finalImgHeight
        );
        
        // Add footer
        addFooter();
      } catch (error) {
        console.error(`PDF Export: Error adding image to PDF for tab ${tab.id}:`, error);
      }
    }
    
    // Restore the original tab
    console.log("PDF Export: Restoring original tab:", activeTabId);
    const originalTabElem = document.querySelector(`[data-tab="${activeTabId}"]`);
    if (originalTabElem) {
      (originalTabElem as HTMLElement).click();
    }
    
    // Save the PDF
    console.log("PDF Export: Saving PDF");
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF Export: Fatal error:', error);
    return false;
  }
};
