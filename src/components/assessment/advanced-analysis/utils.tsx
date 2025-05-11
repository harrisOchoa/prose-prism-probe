
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

// Helper function to ensure that tab panels are properly marked for PDF export
export const prepareTabsForPdf = (sections: string[]): void => {
  sections.forEach(section => {
    const mapping = ADVANCED_SECTION_MAPPING[section as keyof typeof ADVANCED_SECTION_MAPPING];
    
    if (mapping) {
      // This is an advanced section with a parent-child tab structure
      const parentPanel = document.querySelector(`[role="tabpanel"][value="${mapping.parent}"]`);
      const childPanel = parentPanel?.querySelector(`[role="tabpanel"][value="${mapping.child}"]`);
      
      if (parentPanel) {
        parentPanel.classList.add('visible-for-pdf');
      }
      
      if (childPanel) {
        childPanel.classList.add('visible-for-pdf');
      }
    } else {
      // Regular section with a single tab
      const panel = document.querySelector(`[role="tabpanel"][value="${section}"]`);
      if (panel) {
        panel.classList.add('visible-for-pdf');
      }
    }
  });
};
