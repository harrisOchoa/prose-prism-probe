
/**
 * Helper functions for advanced analysis tabs
 */

/**
 * Returns a CSS class for confidence badge color based on confidence level
 */
export const getConfidenceBadgeColor = (confidence: number): string => {
  if (confidence >= 80) return "bg-green-100 text-green-800 border-green-200";
  if (confidence >= 60) return "bg-blue-100 text-blue-800 border-blue-200";
  if (confidence >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (confidence >= 20) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-red-100 text-red-800 border-red-200";
};

/**
 * Returns a CSS class for category badge color based on category
 */
export const getCategoryBadgeColor = (category: string): string => {
  switch(category.toLowerCase()) {
    case "technical":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "behavioral":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "situational":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

/**
 * Returns an analysis button label based on analysis type and data existence
 */
export const getAnalysisButtonLabel = (analysisType: string, hasData: boolean): string => {
  switch(analysisType) {
    case "writing":
      return hasData ? "Regenerate Writing Analysis" : "Generate Writing Analysis";
    case "personality":
      return hasData ? "Regenerate Personality Insights" : "Generate Personality Insights";
    case "questions":
      return hasData ? "Regenerate Interview Questions" : "Generate Interview Questions";
    case "profile":
      return hasData ? "Regenerate Profile Comparison" : "Generate Profile Comparison";
    default:
      return "Generate Analysis";
  }
};
