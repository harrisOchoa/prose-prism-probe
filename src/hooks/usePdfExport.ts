
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { exportToPdf } from "@/utils/pdfExport";
import { prepareTabsForPdf, ADVANCED_SECTION_MAPPING } from "@/components/assessment/advanced-analysis/utils.tsx";

export const usePdfExport = () => {
  const [exporting, setExporting] = useState(false);

  // Section to tab mapping
  const SECTION_TO_TAB_MAPPING = {
    // Main tabs
    overview: "overview",
    aptitude: "aptitude",
    writing: "writing",
    
    // Advanced analysis and sub-tabs
    writingAnalysis: { parent: "advanced", child: "writing" },
    personality: { parent: "advanced", child: "personality" },
    profileMatch: { parent: "advanced", child: "profile" },
    interviewQuestions: { parent: "advanced", child: "questions" },
    aptitudeAnalysis: { parent: "advanced", child: "aptitude" }
  };

  const handleExportPdf = async (
    assessmentData: {
      candidateName: string;
      candidatePosition: string;
    },
    contentType: "Overview" | "Aptitude" | "Writing" | "WritingAnalysis" | "Personality" | "ProfileMatch" | "InterviewQuestions" | string[],
    templateName?: string
  ) => {
    if (exporting) return;
    
    try {
      setExporting(true);
      
      toast({
        title: "Preparing PDF",
        description: "Creating a professional report of this assessment...",
      });
      
      // Apply custom styles for PDF export
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        /* PDF Content Global Styles */
        .pdf-content * {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .pdf-content {
          padding: 10px !important;
          max-width: 100% !important;
          font-family: 'Inter', sans-serif !important;
        }
        .pdf-content .card,
        .pdf-content .assessment-card {
          margin-bottom: 15px !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: none !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        /* Header and title styling */
        .pdf-content h1, 
        .pdf-content h2, 
        .pdf-content h3 {
          color: #4F46E5 !important;
          margin-bottom: 8px !important;
        }
        
        /* Ensure tables are clean and minimal */
        .pdf-content table {
          border-collapse: collapse !important;
          width: 100% !important;
          margin-bottom: 10px !important;
          font-size: 11px !important;
        }
        .pdf-content th {
          background-color: #F5F7FF !important;
          color: #4F46E5 !important;
          font-weight: 600 !important;
          border: 1px solid #e5e7eb !important;
          padding: 6px !important;
          text-align: left !important;
        }
        .pdf-content td {
          padding: 6px !important;
          border: 1px solid #e5e7eb !important;
        }
        
        /* Chart optimizations */
        .pdf-content .recharts-wrapper {
          margin: 0 auto !important;
        }
        
        /* Card styling */
        .pdf-layout-portrait .assessment-card,
        .pdf-layout-portrait .card {
          padding: 15px !important;
          box-shadow: none !important;
        }
        
        /* Progress bars */
        .pdf-layout-portrait .progress {
          height: 8px !important;
          margin-bottom: 10px !important;
        }
        
        /* Typography */
        .pdf-layout-portrait p {
          margin-bottom: 5px !important;
          font-size: 11px !important;
          line-height: 1.4 !important;
        }
        .pdf-layout-portrait .text-xs {
          font-size: 9px !important;
        }
        .pdf-layout-portrait .text-sm {
          font-size: 10px !important; 
        }
        .pdf-layout-portrait .text-lg {
          font-size: 13px !important;
        }
        
        /* Branding elements */
        .pdf-branding-header {
          display: block !important;
          border-bottom: 1px solid #e5e7eb !important;
          margin-bottom: 15px !important;
          padding-bottom: 10px !important;
        }
        .pdf-branding-footer {
          display: block !important;
          border-top: 1px solid #e5e7eb !important;
          margin-top: 15px !important;
          padding-top: 10px !important;
          font-size: 9px !important;
          color: #6b7280 !important;
          text-align: center !important;
        }
        
        /* Make card backgrounds white */
        .pdf-content .bg-muted\\/50 {
          background-color: white !important;
        }
        
        /* Table of contents styles */
        .pdf-toc {
          margin: 20px 0 30px 0 !important;
          page-break-after: always !important;
        }
        
        .pdf-toc-title {
          font-size: 18px !important;
          font-weight: bold !important;
          color: #4F46E5 !important;
          margin-bottom: 15px !important;
          text-align: center !important;
        }
        
        .pdf-toc-item {
          display: flex !important;
          align-items: center !important;
          margin-bottom: 8px !important;
          font-size: 13px !important;
        }
        
        .pdf-toc-number {
          color: #4F46E5 !important;
          margin-right: 8px !important;
          font-weight: bold !important;
        }
        
        .pdf-toc-dots {
          flex: 1 !important;
          height: 1px !important;
          border-bottom: 1px dotted #d1d5db !important;
          margin: 0 8px !important;
        }
        
        .pdf-toc-page {
          color: #4F46E5 !important;
        }
        
        /* Covepage styles */
        .pdf-coverpage {
          text-align: center !important;
          padding: 40px 20px !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          margin-bottom: 20px !important;
          page-break-after: always !important;
        }
        
        .pdf-coverpage-title {
          font-size: 24px !important;
          font-weight: bold !important;
          color: #4F46E5 !important;
          margin: 20px 0 !important;
        }
        
        .pdf-coverpage-subtitle {
          font-size: 18px !important;
          color: #6b7280 !important;
          margin-bottom: 40px !important;
        }
        
        .pdf-coverpage-data {
          display: inline-block !important;
          border: 1px solid #EEF2FF !important;
          background-color: #F5F7FF !important;
          padding: 15px 30px !important;
          border-radius: 6px !important;
        }
        
        .pdf-coverpage-name {
          font-size: 18px !important;
          font-weight: bold !important;
          margin-bottom: 6px !important;
        }
        
        .pdf-coverpage-position {
          font-size: 16px !important;
          color: #4b5563 !important;
        }
        
        /* Section dividers - ENHANCED FOR PAGE BREAKS */
        .pdf-section-divider {
          page-break-before: always !important;
          break-before: always !important;
          margin-top: 30px !important;
          margin-bottom: 20px !important;
          padding-bottom: 10px !important;
          border-bottom: 2px solid #EEF2FF !important;
          display: block !important;
          width: 100% !important;
        }
        
        .pdf-section-title {
          font-size: 20px !important;
          font-weight: bold !important;
          color: #4F46E5 !important;
        }
        
        /* Enhance card headers */
        .pdf-content .card-header {
          border-bottom: 2px solid #EEF2FF !important;
        }
        
        /* Critical: Make nested tabs (like in Advanced Analysis) visible in PDF */
        .pdf-content [role="tabpanel"],
        .pdf-content .visible-for-pdf {
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
          height: auto !important;
          overflow: visible !important;
          position: static !important;
        }
        
        /* Fix for nested tabs in advanced analysis */
        .pdf-content [data-state="inactive"] {
          display: block !important;
        }
        
        /* CRITICAL: Make sure all tab panels are visible in PDF */
        .pdf-content [role="tabpanel"],
        .visible-for-pdf,
        .pdf-show {
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
          height: auto !important;
          overflow: visible !important;
          position: static !important;
        }
        
        /* Force advanced analysis tabs to be visible */
        .pdf-content [value="advanced"] [role="tabpanel"],
        .pdf-content .tab-content {
          display: block !important;
          opacity: 1 !important;
          height: auto !important;
          overflow: visible !important;
        }
        
        /* NEW: Fix for section page breaks */
        .pdf-section-container {
          page-break-before: always !important;
          break-before: page !important;
          page-break-after: auto !important;
          break-after: auto !important;
          display: block !important;
          width: 100% !important;
        }
        
        /* Ensure each section starts on a new page */
        .pdf-section {
          page-break-before: always !important;
          break-before: page !important;
          display: block !important;
        }
        
        /* Ensure no page breaks in the middle of a card */
        .pdf-content .card {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin-bottom: 20px !important;
        }
      `;
      document.head.appendChild(styleElement);
      
      // Format filename components
      const formattedName = assessmentData.candidateName.replace(/\s+/g, '');
      const formattedPosition = assessmentData.candidatePosition.replace(/\s+/g, '');
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Handle multi-section export
      let filename = '';
      let reportTitle = '';
      
      if (Array.isArray(contentType)) {
        // This is a multi-section export (custom report)
        filename = `${formattedName}_${formattedPosition}_${templateName || 'CustomReport'}_${timestamp}`;
        reportTitle = templateName ? 
          `${templateName.charAt(0).toUpperCase() + templateName.slice(1)} Assessment Report` : 
          'Complete Assessment Report';
      } else {
        // This is a single-section export
        filename = `${formattedName}_${formattedPosition}_${contentType}_${timestamp}`;
        reportTitle = `${contentType} Assessment Report`;
      }
      
      // Before generating PDF, hide elements that shouldn't be included
      document.querySelectorAll('.pdf-hide').forEach((el) => {
        el.classList.add('hidden-for-pdf');
      });

      document.querySelectorAll('.pdf-show').forEach((el) => {
        el.classList.add('visible-for-pdf');
      });
      
      // Get tabs element
      const tabsElement = document.querySelector('[role="tablist"]');
      if (tabsElement) {
        tabsElement.classList.add('hidden-for-pdf');
      }
      
      // For multi-section exports, use our enhanced tab preparation
      if (Array.isArray(contentType)) {
        // Clear any previous section containers
        document.querySelectorAll('.pdf-section-container').forEach(el => el.remove());
        
        // First, we want to mark all the necessary tab panels for inclusion
        prepareTabsForPdf(contentType);
        
        // Then prepare the visual structure with TOC and section dividers
        prepareMultiSectionReport(contentType, reportTitle);
      } else {
        // For single section exports, just switch to the correct tab
        activateTab(contentType.toLowerCase());
      }
      
      // Add branding elements programmatically
      const contentElement = document.getElementById('assessment-content');
      if (contentElement) {
        // Add PDF-specific styling class
        contentElement.classList.add('pdf-content');
        
        // Create branding header if it doesn't exist
        if (!contentElement.querySelector('.pdf-branding-header')) {
          const brandingHeader = document.createElement('div');
          brandingHeader.className = 'pdf-branding-header pdf-show visible-for-pdf';
          brandingHeader.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:18px;font-weight:bold;color:#4F46E5;">HireScribe Assessment</div>
              <div style="font-size:12px;color:#6b7280;">CONFIDENTIAL</div>
            </div>
            <div style="font-size:14px;color:#6b7280;margin-top:4px">
              ${assessmentData.candidateName} - ${assessmentData.candidatePosition}
            </div>
          `;
          contentElement.insertBefore(brandingHeader, contentElement.firstChild);
        }
        
        // Create branding footer if it doesn't exist
        if (!contentElement.querySelector('.pdf-branding-footer')) {
          const brandingFooter = document.createElement('div');
          brandingFooter.className = 'pdf-branding-footer pdf-show visible-for-pdf';
          brandingFooter.innerHTML = `
            <div>HireScribe Assessment Platform © ${new Date().getFullYear()}</div>
            <div style="margin-top:2px">This report is confidential and intended for authorized personnel only.</div>
          `;
          contentElement.appendChild(brandingFooter);
        }
      }
      
      // DEBUG HELPER: Add visual indicators for what's being captured 
      const DEBUG_MODE = true; // Set to true to see what's being included/excluded
      
      if (DEBUG_MODE) {
        // Add a green outline to elements that will be included in the PDF
        document.querySelectorAll('.visible-for-pdf, .pdf-show').forEach(el => {
          (el as HTMLElement).style.outline = '2px solid green';
        });
        
        // Add a red outline to elements that will be excluded
        document.querySelectorAll('[role="tabpanel"]:not(.visible-for-pdf):not(.pdf-show)').forEach(el => {
          (el as HTMLElement).style.outline = '2px solid red';
        });
        
        console.log('DEBUG MODE: Green outline = included in PDF, Red outline = excluded from PDF');
      }
      
      try {
        // Add a slight delay before generating PDF to ensure DOM is updated
        setTimeout(async () => {
          try {
            console.log('Starting PDF generation with the following tab panels visible:');
            document.querySelectorAll('[role="tabpanel"].visible-for-pdf, [role="tabpanel"].pdf-show').forEach(panel => {
              console.log(`- ${panel.getAttribute('value') || 'unnamed'} panel is marked visible`);
            });
            
            // Force each section container to have a page break
            document.querySelectorAll('.pdf-section-container').forEach(section => {
              (section as HTMLElement).style.pageBreakBefore = 'always';
              (section as HTMLElement).style.breakBefore = 'page';
            });
            
            // Generate the PDF
            const success = await exportToPdf("assessment-content", filename);
            
            // Clean up: remove temporary elements and classes
            if (contentElement) {
              contentElement.classList.remove('pdf-content');
              
              // Remove temporary branding elements
              const headerEl = contentElement.querySelector('.pdf-branding-header');
              if (headerEl) headerEl.remove();
              
              const footerEl = contentElement.querySelector('.pdf-branding-footer');
              if (footerEl) footerEl.remove();
              
              // Remove cover page, TOC and section dividers
              document.querySelectorAll('.pdf-coverpage, .pdf-toc, .pdf-section-divider, .pdf-section-container').forEach(el => el.remove());
            }
            
            // Restore the DOM after PDF generation
            document.querySelectorAll('.hidden-for-pdf').forEach((el) => {
              el.classList.remove('hidden-for-pdf');
            });
            
            document.querySelectorAll('.visible-for-pdf').forEach((el) => {
              el.classList.remove('visible-for-pdf');
            });
            
            // Remove debug outlines if they were added
            if (DEBUG_MODE) {
              document.querySelectorAll('[style*="outline"]').forEach((el: any) => {
                el.style.outline = '';
              });
            }
            
            // Remove custom styles
            document.head.removeChild(styleElement);
            
            // Show appropriate toast message
            if (success) {
              toast({
                title: "PDF Exported Successfully",
                description: "The professional assessment report has been downloaded.",
                variant: "default",
              });
            } else {
              toast({
                title: "PDF Export Failed",
                description: "There was an error creating the PDF. Please try again.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("PDF export error during generation:", error);
            toast({
              title: "PDF Export Failed",
              description: "There was an error creating the PDF. Please try again.",
              variant: "destructive",
            });
          } finally {
            setExporting(false);
          }
        }, 1000); // Increased delay to ensure DOM updates properly
      } catch (error) {
        console.error("PDF export preparation error:", error);
        toast({
          title: "PDF Export Failed",
          description: "There was an error preparing the PDF. Please try again.",
          variant: "destructive",
        });
        setExporting(false);
      }
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "PDF Export Failed",
        description: "There was an error creating the PDF. Please try again.",
        variant: "destructive",
      });
      setExporting(false);
    }
  };
  
  // Enhanced function to activate both main and nested tabs
  const activateTab = (tabId: string) => {
    console.log(`Activating tab: ${tabId}`);
    
    // Check if this is a nested tab
    const mapping = SECTION_TO_TAB_MAPPING[tabId as keyof typeof SECTION_TO_TAB_MAPPING];
    
    if (mapping && typeof mapping === 'object' && mapping.parent && mapping.child) {
      // First activate the parent tab
      const parentTabButton = document.querySelector(`[data-state="inactive"][value="${mapping.parent}"]`) as HTMLElement;
      if (parentTabButton) {
        console.log(`Activating parent tab: ${mapping.parent}`);
        parentTabButton.click();
        
        // Give a small delay to ensure parent tab is activated before clicking child
        setTimeout(() => {
          // Then activate the child tab
          const childTabButton = document.querySelector(`[data-state="inactive"][value="${mapping.child}"]`) as HTMLElement;
          if (childTabButton) {
            console.log(`Activating child tab: ${mapping.child}`);
            childTabButton.click();
          } else {
            console.log(`Child tab button not found: ${mapping.child}`);
            
            // Alternative approach - find any button related to this child tab
            const anyChildButton = document.querySelector(`[value="${mapping.child}"]`) as HTMLElement;
            if (anyChildButton) {
              console.log(`Found alternate child tab button: ${mapping.child}`);
              anyChildButton.click();
            }
          }
        }, 200);
      } else {
        console.log(`Parent tab button not found: ${mapping.parent}`);
        
        // Alternative approach - try to find any button for this tab
        const anyParentButton = document.querySelector(`[value="${mapping.parent}"]`) as HTMLElement;
        if (anyParentButton) {
          console.log(`Found alternate parent tab button: ${mapping.parent}`);
          anyParentButton.click();
        }
      }
    } else {
      // Simple tab
      const simpleTabId = typeof mapping === 'string' ? mapping : tabId;
      const tabButton = document.querySelector(`[data-state="inactive"][value="${simpleTabId}"]`) as HTMLElement;
      if (tabButton) {
        console.log(`Activating simple tab: ${simpleTabId}`);
        tabButton.click();
      } else {
        console.log(`Simple tab button not found: ${simpleTabId}`);
        
        // Alternative approach - try to find any button for this tab
        const anyButton = document.querySelector(`[value="${simpleTabId}"]`) as HTMLElement;
        if (anyButton) {
          console.log(`Found alternate tab button: ${simpleTabId}`);
          anyButton.click();
        }
      }
    }
    
    // Wait for tab activation and then force all relevant content to be visible
    setTimeout(() => {
      document.querySelectorAll('[role="tabpanel"][data-state="active"]').forEach(panel => {
        panel.classList.add('visible-for-pdf', 'pdf-show');
        console.log(`Marked active panel as visible: ${panel.getAttribute('value') || 'unnamed'}`);
        
        // Also mark all nested tabpanels as visible
        panel.querySelectorAll('[role="tabpanel"]').forEach(nestedPanel => {
          nestedPanel.classList.add('visible-for-pdf', 'pdf-show');
          nestedPanel.setAttribute('data-state', 'active');
          console.log(`Marked nested panel as visible: ${nestedPanel.getAttribute('value') || 'unnamed'}`);
        });
      });
    }, 300);
  };
  
  // Enhanced function to prepare a multi-section report with cover page and TOC
  const prepareMultiSectionReport = (sections: string[], reportTitle: string) => {
    const contentElement = document.getElementById('assessment-content');
    if (!contentElement) return;
    
    console.log(`Preparing multi-section report with sections:`, sections);
    
    // Create cover page
    const coverPage = document.createElement('div');
    coverPage.className = 'pdf-coverpage pdf-show visible-for-pdf';
    coverPage.innerHTML = `
      <div style="text-align:center;margin-bottom:30px;">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect width="80" height="80" rx="16" fill="#EEF2FF"/>
          <path d="M40 20C26.8 20 16 30.8 16 44c0 13.2 10.8 24 24 24s24-10.8 24-24c0-13.2-10.8-24-24-24zm0 8c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8zm0 32c-6.7 0-12.6-3.4-16-8.6 0.1-5.3 10.7-8.2 16-8.2s15.9 2.9 16 8.2c-3.4 5.2-9.3 8.6-16 8.6z" fill="#4F46E5"/>
        </svg>
      </div>
      <h1 class="pdf-coverpage-title">${reportTitle}</h1>
      <p class="pdf-coverpage-subtitle">Generated on ${new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</p>
      <div class="pdf-coverpage-data">
        <div class="pdf-coverpage-name" id="candidate-name"></div>
        <div class="pdf-coverpage-position" id="candidate-position"></div>
      </div>
    `;
    
    // Insert cover page at the beginning of the content
    contentElement.insertBefore(coverPage, contentElement.firstChild);
    
    // Create table of contents
    const toc = document.createElement('div');
    toc.className = 'pdf-toc pdf-show visible-for-pdf';
    
    let tocHtml = `<h2 class="pdf-toc-title">Table of Contents</h2>`;
    
    const sectionNames = {
      overview: "Overview",
      aptitude: "Aptitude Assessment",
      writing: "Writing Assessment",
      writingAnalysis: "Writing Analysis",
      personality: "Personality Insights",
      profileMatch: "Profile Match",
      interviewQuestions: "Interview Questions",
      aptitudeAnalysis: "Aptitude Analysis"
    };
    
    sections.forEach((section, index) => {
      const sectionName = sectionNames[section as keyof typeof sectionNames] || section;
      tocHtml += `
        <div class="pdf-toc-item">
          <span class="pdf-toc-number">${index + 1}.</span>
          <span>${sectionName}</span>
          <span class="pdf-toc-dots"></span>
          <span class="pdf-toc-page">${index + 3}</span> <!-- Cover (1) + TOC (1) + Section Number -->
        </div>
      `;
    });
    
    toc.innerHTML = tocHtml;
    
    // Insert TOC after cover page
    coverPage.insertAdjacentElement('afterend', toc);
    
    // First activate all needed tabs and mark their panels for visibility
    for (const section of sections) {
      activateTab(section);
    }
    
    // Enhanced: Create section containers that ensure each section starts on a new page
    sections.forEach((section, index) => {
      console.log(`Adding container for section ${index + 1}: ${section}`);
      
      // Get the right tabpanel element for this section based on mapping
      let tabPanel = null;
      const mapping = SECTION_TO_TAB_MAPPING[section as keyof typeof SECTION_TO_TAB_MAPPING];
      
      if (mapping && typeof mapping === 'object' && mapping.parent && mapping.child) {
        // This is a nested tab structure (like in Advanced Analysis)
        // First get the parent tab panel
        const parentTabContent = document.querySelector(`[role="tabpanel"][value="${mapping.parent}"]`);
        if (parentTabContent) {
          // Then find the child tab panel within it
          tabPanel = parentTabContent.querySelector(
            `[role="tabpanel"][value="${mapping.child}"], 
             [data-value="${mapping.child}"], 
             [data-tab="${mapping.child}"], 
             .tab-content-${mapping.child}`
          );
          
          // If we can't find the child tab panel directly, use the parent
          if (!tabPanel) {
            tabPanel = parentTabContent;
          }
        }
      } else {
        // This is a main tab
        const tabValue = typeof mapping === 'string' ? mapping : section;
        tabPanel = document.querySelector(`[role="tabpanel"][value="${tabValue}"]`);
      }
      
      if (tabPanel) {
        console.log(`Found tab panel for section: ${section}`);
        
        // Create a container that will force a page break
        const sectionContainer = document.createElement('div');
        sectionContainer.className = 'pdf-section-container pdf-show visible-for-pdf';
        sectionContainer.style.pageBreakBefore = 'always';
        sectionContainer.style.breakBefore = 'page';
        
        // Create section divider/header
        const divider = document.createElement('div');
        divider.className = 'pdf-section-divider pdf-show visible-for-pdf';
        divider.innerHTML = `
          <h2 class="pdf-section-title">${index + 1}. ${sectionNames[section as keyof typeof sectionNames] || section}</h2>
        `;
        
        // Clone the tab panel content
        const contentClone = tabPanel.cloneNode(true);
        
        // Add the divider and content to the container
        sectionContainer.appendChild(divider);
        sectionContainer.appendChild(contentClone);
        
        // Make this container visible for PDF
        sectionContainer.classList.add('visible-for-pdf', 'pdf-show');
        
        // Add to the main content element
        contentElement.appendChild(sectionContainer);
        
        // Also make the original tab panel visible (belt and suspenders approach)
        tabPanel.classList.add('visible-for-pdf', 'pdf-show');
        tabPanel.setAttribute('data-state', 'active');
        (tabPanel as HTMLElement).style.display = 'block';
        (tabPanel as HTMLElement).style.opacity = '1';
        (tabPanel as HTMLElement).style.visibility = 'visible';
      } else {
        console.warn(`Tab panel not found for section: ${section}`);
      }
    });
    
    // Populate candidate info in cover page
    const candidateNameEl = document.getElementById('candidate-name');
    const candidatePositionEl = document.getElementById('candidate-position');
    
    if (candidateNameEl && candidatePositionEl) {
      candidateNameEl.textContent = assessmentData.candidateName || '';
      candidatePositionEl.textContent = assessmentData.candidatePosition || '';
    }
  };

  return { handleExportPdf, exporting };
};
