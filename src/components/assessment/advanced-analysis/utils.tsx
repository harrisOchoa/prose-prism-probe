
import React from "react";

// Category badge colors mapping
export const getCategoryBadgeColor = (category: string) => {
  const categoryMap: {[key: string]: string} = {
    "Technical": "bg-blue-100 text-blue-800",
    "Behavioral": "bg-green-100 text-green-800",
    "Problem Solving": "bg-purple-100 text-purple-800",
    "Communication": "bg-amber-100 text-amber-800",
    "Leadership": "bg-indigo-100 text-indigo-800",
    "Critical Thinking": "bg-orange-100 text-orange-800",
    "Cultural Fit": "bg-pink-100 text-pink-800"
  };
  
  return categoryMap[category] || "bg-gray-100 text-gray-800";
};

// Confidence badge colors mapping
export const getConfidenceBadgeColor = (confidence: number) => {
  if (confidence >= 90) return "bg-green-100 text-green-800";
  if (confidence >= 75) return "bg-blue-100 text-blue-800";
  if (confidence >= 60) return "bg-amber-100 text-amber-800";
  return "bg-gray-100 text-gray-800";
};

// Get button label based on analysis type and existence
export const getAnalysisButtonLabel = (type: string, exists: boolean) => {
  const typeLabels: {[key: string]: {exists: string, generate: string}} = {
    writing: {
      exists: "Regenerate Writing Analysis",
      generate: "Generate Writing Analysis"
    },
    personality: {
      exists: "Regenerate Personality Insights",
      generate: "Generate Personality Insights"
    },
    questions: {
      exists: "Regenerate Interview Questions",
      generate: "Generate Interview Questions"
    },
    profile: {
      exists: "Regenerate Profile Match",
      generate: "Generate Profile Match"
    },
    aptitude: {
      exists: "Regenerate Aptitude Analysis",
      generate: "Generate Aptitude Analysis"
    }
  };
  
  const defaultLabels = {
    exists: "Regenerate Analysis",
    generate: "Generate Analysis"
  };
  
  const labels = typeLabels[type] || defaultLabels;
  return exists ? labels.exists : labels.generate;
};

// Map section names to tab values for advanced analysis
export const ADVANCED_SECTION_MAPPING = {
  writingAnalysis: { parent: "advanced", child: "writing" },
  personality: { parent: "advanced", child: "personality" },
  profileMatch: { parent: "advanced", child: "profile" },
  interviewQuestions: { parent: "advanced", child: "questions" },
  aptitudeAnalysis: { parent: "advanced", child: "aptitude" }
};

// Function to prepare tabs for PDF export by marking them as visible
export const prepareTabsForPdf = (sections: string[]) => {
  console.log("Preparing tabs for PDF export:", sections);
  
  // Reset visibility classes first
  document.querySelectorAll('.pdf-show, .visible-for-pdf').forEach(el => {
    el.classList.remove('pdf-show', 'visible-for-pdf');
  });
  
  // Process each section
  sections.forEach(section => {
    console.log(`Processing section: ${section}`);
    
    // For advanced analysis sections, we need to handle nested tabs
    if (section in ADVANCED_SECTION_MAPPING) {
      const mapping = ADVANCED_SECTION_MAPPING[section as keyof typeof ADVANCED_SECTION_MAPPING];
      if (typeof mapping === 'object') {
        // First, find and mark the parent tab panel
        const parentTabPanel = document.querySelector(`[role="tabpanel"][value="${mapping.parent}"]`);
        if (parentTabPanel) {
          console.log(`Found parent tab panel for ${section}:`, parentTabPanel);
          parentTabPanel.classList.add('visible-for-pdf', 'pdf-show');
          parentTabPanel.setAttribute('data-state', 'active');
          (parentTabPanel as HTMLElement).style.display = 'block';
          (parentTabPanel as HTMLElement).style.opacity = '1';
          (parentTabPanel as HTMLElement).style.visibility = 'visible';
          
          // Then find and mark the child tab panel
          const childTabPanel = parentTabPanel.querySelector(
            `[role="tabpanel"][value="${mapping.child}"], 
             [data-value="${mapping.child}"], 
             [data-tab="${mapping.child}"],
             .tab-content-${mapping.child}`
          );
          
          if (childTabPanel) {
            console.log(`Found child tab panel for ${section}:`, childTabPanel);
            childTabPanel.classList.add('visible-for-pdf', 'pdf-show');
            childTabPanel.setAttribute('data-state', 'active');
            (childTabPanel as HTMLElement).style.display = 'block';
            (childTabPanel as HTMLElement).style.opacity = '1';
            (childTabPanel as HTMLElement).style.visibility = 'visible';
            
            // Also mark any content inside this tab
            childTabPanel.querySelectorAll('.card, .assessment-card').forEach(card => {
              card.classList.add('visible-for-pdf', 'pdf-show');
            });
          } else {
            console.warn(`Could not find child tab panel for ${section} in parent:`, parentTabPanel);
            
            // If we can't find the specific child, mark all child tabpanels as visible
            parentTabPanel.querySelectorAll('[role="tabpanel"]').forEach(panel => {
              panel.classList.add('visible-for-pdf', 'pdf-show');
              panel.setAttribute('data-state', 'active');
              (panel as HTMLElement).style.display = 'block';
              (panel as HTMLElement).style.opacity = '1';
              (panel as HTMLElement).style.visibility = 'visible';
            });
          }
        } else {
          console.warn(`Could not find parent tab panel for ${section}`);
        }
      }
    } else {
      // For main tabs, simply find and mark the tab panel
      const tabPanel = document.querySelector(`[role="tabpanel"][value="${section}"]`);
      if (tabPanel) {
        console.log(`Found tab panel for ${section}:`, tabPanel);
        tabPanel.classList.add('visible-for-pdf', 'pdf-show');
        tabPanel.setAttribute('data-state', 'active');
        (tabPanel as HTMLElement).style.display = 'block';
        (tabPanel as HTMLElement).style.opacity = '1';
        (tabPanel as HTMLElement).style.visibility = 'visible';
      } else {
        console.warn(`Could not find tab panel for ${section}`);
      }
    }
  });
  
  // Double check all tabs marked as visible
  console.log("Tab panels marked as visible for PDF:", document.querySelectorAll('[role="tabpanel"].visible-for-pdf, [role="tabpanel"].pdf-show').length);
};
