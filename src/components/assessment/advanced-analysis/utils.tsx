
import React from "react";

export const getProgressColor = (value: number): string => {
  if (value >= 80) return "bg-green-500";
  if (value >= 60) return "bg-blue-500";
  if (value >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

export const getConfidenceBadgeColor = (confidence: number): string => {
  if (confidence >= 80) return "bg-green-100 text-green-800 border-green-200";
  if (confidence >= 60) return "bg-blue-100 text-blue-800 border-blue-200";
  if (confidence >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
};

export const getCategoryBadgeColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case "technical":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "behavioral":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "problem solving":
      return "bg-green-100 text-green-800 border-green-200";
    case "experience":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "culture fit":
      return "bg-pink-100 text-pink-800 border-pink-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getAnalysisButtonLabel = (type: string, exists: boolean = false): string => {
  if (exists) {
    return `Regenerate ${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`;
  }
  
  return `Generate ${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`;
};

// Define a mapping for PDF export sections to their respective tabs
export const ADVANCED_SECTION_MAPPING = {
  writingAnalysis: { parent: "advanced", child: "writing" },
  personality: { parent: "advanced", child: "personality" },
  profileMatch: { parent: "advanced", child: "profile" },
  interviewQuestions: { parent: "advanced", child: "questions" },
  aptitudeAnalysis: { parent: "advanced", child: "aptitude" }
};

// Enhanced helper function to ensure that tab panels are properly marked for PDF export
export const prepareTabsForPdf = (sections: string[]): void => {
  console.log("Preparing tabs for PDF export, sections:", sections);
  
  // First, ensure all tab panels are in a known state
  document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
    panel.classList.remove('visible-for-pdf', 'pdf-show');
  });
  
  // Process each section and mark its tab panel for inclusion
  sections.forEach(section => {
    const mapping = ADVANCED_SECTION_MAPPING[section as keyof typeof ADVANCED_SECTION_MAPPING];
    
    if (mapping) {
      // This is an advanced section with a parent-child tab structure
      console.log(`Processing advanced section: ${section} => parent: ${mapping.parent}, child: ${mapping.child}`);
      
      // Find and mark the parent panel
      const parentPanel = document.querySelector(`[role="tabpanel"][value="${mapping.parent}"]`);
      if (parentPanel) {
        parentPanel.classList.add('visible-for-pdf', 'pdf-show');
        console.log(`- Marked parent panel for ${mapping.parent}`);
        
        // Now find and mark the child panel
        const childPanel = parentPanel.querySelector(`[role="tabpanel"][value="${mapping.child}"]`);
        if (childPanel) {
          childPanel.classList.add('visible-for-pdf', 'pdf-show');
          console.log(`- Marked child panel for ${mapping.child}`);
        } else {
          // Try alternative selector approaches since the structure might be different
          const alternativeChildPanel = parentPanel.querySelector(`.tab-content-${mapping.child}, [data-tab="${mapping.child}"], [data-value="${mapping.child}"]`);
          if (alternativeChildPanel) {
            alternativeChildPanel.classList.add('visible-for-pdf', 'pdf-show');
            console.log(`- Marked alternative child panel for ${mapping.child}`);
          } else {
            console.warn(`Could not find child panel for ${mapping.child} within ${mapping.parent}`);
          }
        }
        
        // Force all content within this parent panel to be visible
        parentPanel.querySelectorAll('.tab-content, [role="tabpanel"]').forEach(el => {
          el.classList.add('visible-for-pdf', 'pdf-show');
          el.setAttribute('data-state', 'active');
        });
      } else {
        console.warn(`Could not find parent panel for ${mapping.parent}`);
      }
    } else {
      // Regular section with a single tab
      console.log(`Processing regular section: ${section}`);
      const panel = document.querySelector(`[role="tabpanel"][value="${section}"]`);
      if (panel) {
        panel.classList.add('visible-for-pdf', 'pdf-show');
        console.log(`- Marked panel for ${section}`);
      } else {
        console.warn(`Could not find panel for ${section}`);
      }
    }
  });
  
  // As a fail-safe, force all analysis tabs to be visible in PDF
  if (sections.some(s => ADVANCED_SECTION_MAPPING[s as keyof typeof ADVANCED_SECTION_MAPPING])) {
    console.log("Including advanced analysis section - force showing all analysis tabs");
    const advancedPanel = document.querySelector('[role="tabpanel"][value="advanced"]');
    if (advancedPanel) {
      advancedPanel.classList.add('visible-for-pdf', 'pdf-show');
      
      // Also force all nested tab panels to be visible
      advancedPanel.querySelectorAll('[role="tabpanel"]').forEach(nestedPanel => {
        nestedPanel.classList.add('visible-for-pdf', 'pdf-show');
        nestedPanel.setAttribute('data-state', 'active');
      });
    }
  }
  
  // Debug help - log what's marked for inclusion
  console.log("Elements marked for PDF inclusion:");
  document.querySelectorAll('.visible-for-pdf, .pdf-show').forEach(el => {
    console.log(`- ${el.tagName} ${el.className} ${el.getAttribute('value') || ''}`);
  });
};
