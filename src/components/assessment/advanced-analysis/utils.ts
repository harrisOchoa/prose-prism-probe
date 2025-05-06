
// Badge color selection for confidence ratings
export const getConfidenceBadgeColor = (confidence: number): string => {
  if (confidence >= 80) {
    return "bg-green-100 text-green-800 hover:bg-green-200";
  } else if (confidence >= 60) {
    return "bg-blue-100 text-blue-800 hover:bg-blue-200";
  } else if (confidence >= 40) {
    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
  } else {
    return "bg-red-100 text-red-800 hover:bg-red-200";
  }
};

// Badge color selection for interview question categories
export const getCategoryBadgeColor = (category: string): string => {
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes("technical") || lowerCategory.includes("skill")) {
    return "bg-blue-100 text-blue-800 hover:bg-blue-200";
  } else if (lowerCategory.includes("behavioral") || lowerCategory.includes("soft")) {
    return "bg-purple-100 text-purple-800 hover:bg-purple-200";
  } else if (lowerCategory.includes("culture") || lowerCategory.includes("fit")) {
    return "bg-green-100 text-green-800 hover:bg-green-200";
  } else if (lowerCategory.includes("challenge") || lowerCategory.includes("weakness")) {
    return "bg-amber-100 text-amber-800 hover:bg-amber-200";
  } else if (lowerCategory.includes("leadership") || lowerCategory.includes("management")) {
    return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
  } else {
    return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

// Get button label based on analysis type and existence
export const getAnalysisButtonLabel = (type: string, exists: boolean): string => {
  if (exists) {
    return `Regenerate ${getLabelFromType(type)}`;
  }
  return `Generate ${getLabelFromType(type)}`;
};

// Get display friendly name from type id
const getLabelFromType = (type: string): string => {
  switch (type) {
    case "writing":
      return "Writing Analysis";
    case "personality":
      return "Personality Insights";
    case "questions":
      return "Interview Questions";
    case "interview":
      return "Interview Questions";
    case "profile":
      return "Profile Match";
    case "aptitude":
      return "Aptitude Analysis";
    default:
      return "Analysis";
  }
};
