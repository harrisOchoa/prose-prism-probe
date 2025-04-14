
// This file contains utility functions for the advanced analysis tab

export const getConfidenceBadgeColor = (confidence: number): string => {
  if (confidence >= 90) return "bg-green-100 text-green-800 hover:bg-green-200";
  if (confidence >= 80) return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
  if (confidence >= 70) return "bg-blue-100 text-blue-800 hover:bg-blue-200";
  if (confidence >= 60) return "bg-sky-100 text-sky-800 hover:bg-sky-200";
  if (confidence >= 50) return "bg-amber-100 text-amber-800 hover:bg-amber-200";
  return "bg-gray-100 text-gray-800 hover:bg-gray-200";
};

export const getCategoryBadgeColor = (category: string): string => {
  const categories: Record<string, string> = {
    "Technical Skills": "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    "Problem Solving": "bg-blue-100 text-blue-800 hover:bg-blue-200",
    "Leadership": "bg-purple-100 text-purple-800 hover:bg-purple-200",
    "Communication": "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    "Culture Fit": "bg-teal-100 text-teal-800 hover:bg-teal-200",
    "Experience": "bg-amber-100 text-amber-800 hover:bg-amber-200",
    "Behavioral": "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
    "Situational": "bg-violet-100 text-violet-800 hover:bg-violet-200"
  };
  
  return categories[category] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
};

export const getAnalysisButtonLabel = (analysisType: string): string => {
  const labels: Record<string, { new: string, existing: string }> = {
    "writing": {
      new: "Generate Writing Analysis",
      existing: "Regenerate Analysis"
    },
    "personality": {
      new: "Generate Personality Insights",
      existing: "Regenerate Insights"
    },
    "questions": {
      new: "Generate Interview Questions",
      existing: "Regenerate Questions"
    },
    "profile": {
      new: "Generate Profile Match",
      existing: "Regenerate Match"
    }
  };
  
  return labels[analysisType]?.new || `Generate ${analysisType}`;
};

// Add the missing getProgressColor function
export const getProgressColor = (value: number): string => {
  if (value >= 70) return "#22c55e"; // green
  if (value >= 50) return "#eab308"; // yellow
  return "#ef4444"; // red
};
