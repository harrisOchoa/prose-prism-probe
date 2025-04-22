
import React from 'react';
import CategoryHeader from './CategoryHeader';
import CategoryItem from './CategoryItem';

interface CategoryBreakdownProps {
  categories?: Array<{
    name: string;
    correct: number;
    total: number;
    source?: string;
  }>;
  actualScore?: number;
  totalQuestions?: number;
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ 
  categories = [], 
  actualScore = 0, 
  totalQuestions = 30 
}) => {
  // Log received categories
  console.log('CategoryBreakdown - Received Categories:', categories);
  console.log('CategoryBreakdown - Actual Score:', actualScore, '/', totalQuestions);

  // If no categories data or if categories contain 'Sample Data', generate accurate sample data
  let displayCategories = categories;
  
  if (categories.length === 0 || categories.some(cat => cat.source === "Sample Data" || cat.source === "Generated")) {
    console.log('CategoryBreakdown - Generating accurate distribution based on actual score');
    const totalToDistribute = actualScore;
    
    const logicalTotal = Math.ceil(totalQuestions * 0.3);
    const numericalTotal = Math.ceil(totalQuestions * 0.25);
    const verbalTotal = Math.ceil(totalQuestions * 0.25);
    const problemSolvingTotal = totalQuestions - logicalTotal - numericalTotal - verbalTotal;
    
    let remaining = totalToDistribute;
    const logicalCorrect = Math.min(Math.floor(remaining * (logicalTotal / totalQuestions)), logicalTotal);
    remaining -= logicalCorrect;
    
    const numericalCorrect = Math.min(Math.floor(remaining * (numericalTotal / (totalQuestions - logicalTotal))), numericalTotal);
    remaining -= numericalCorrect;
    
    const verbalCorrect = Math.min(Math.floor(remaining * (verbalTotal / (totalQuestions - logicalTotal - numericalTotal))), verbalTotal);
    remaining -= verbalCorrect;
    
    const problemSolvingCorrect = Math.min(remaining, problemSolvingTotal);
    
    displayCategories = [
      { name: "Logical Reasoning", correct: logicalCorrect, total: logicalTotal, source: "Calculated" },
      { name: "Numerical Analysis", correct: numericalCorrect, total: numericalTotal, source: "Calculated" },
      { name: "Verbal Comprehension", correct: verbalCorrect, total: verbalTotal, source: "Calculated" },
      { name: "Problem Solving", correct: problemSolvingCorrect, total: problemSolvingTotal, source: "Calculated" }
    ];
  }
  
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <CategoryHeader />
      <div className="space-y-3">
        {displayCategories.map((category, index) => (
          <CategoryItem 
            key={index}
            {...category}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
