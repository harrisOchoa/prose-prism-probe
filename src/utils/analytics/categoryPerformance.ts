
import { AssessmentData } from "@/types/assessment";

/**
 * Calculate category performance from aptitude categories
 */
export const calculateCategoryPerformance = (assessments: AssessmentData[]): { name: string; percentage: number; }[] => {
  let categoryPerformance: { name: string; percentage: number; }[] = [];
  
  const categoryCounts = new Map<string, { correct: number; total: number; }>();
  
  assessments.forEach(assessment => {
    if (assessment.aptitudeCategories && Array.isArray(assessment.aptitudeCategories)) {
      assessment.aptitudeCategories.forEach(cat => {
        if (!categoryCounts.has(cat.name)) {
          categoryCounts.set(cat.name, { correct: 0, total: 0 });
        }
        
        const catData = categoryCounts.get(cat.name)!;
        catData.correct += cat.correct;
        catData.total += cat.total;
      });
    }
  });
  
  // Convert the category data to percentages
  if (categoryCounts.size > 0) {
    categoryPerformance = Array.from(categoryCounts.entries())
      .map(([name, data]) => ({
        name,
        percentage: Math.round((data.correct / data.total) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 4); // Get top 4 categories
  } else {
    // Fallback if no real data
    categoryPerformance = [
      { name: "Critical Thinking", percentage: 92 },
      { name: "Problem Solving", percentage: 87 },
      { name: "Communication", percentage: 75 },
      { name: "Technical Knowledge", percentage: 68 }
    ];
  }
  
  return categoryPerformance;
};
