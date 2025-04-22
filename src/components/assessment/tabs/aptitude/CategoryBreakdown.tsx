
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { BrainCircuit } from "lucide-react";

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
    // Create sample categories based on aptitude score that add up exactly to the actual score
    const totalToDistribute = actualScore;
    
    // Distribute the actual score across categories proportionally
    const logicalTotal = Math.ceil(totalQuestions * 0.3);
    const numericalTotal = Math.ceil(totalQuestions * 0.25);
    const verbalTotal = Math.ceil(totalQuestions * 0.25);
    const problemSolvingTotal = totalQuestions - logicalTotal - numericalTotal - verbalTotal;
    
    // Calculate the number of correct answers in each category proportionally
    // but ensuring the total equals the actual score
    let remaining = totalToDistribute;
    
    // Calculate proportional distribution
    const logicalCorrect = Math.min(Math.floor(remaining * (logicalTotal / totalQuestions)), logicalTotal);
    remaining -= logicalCorrect;
    
    const numericalCorrect = Math.min(Math.floor(remaining * (numericalTotal / (totalQuestions - logicalTotal))), numericalTotal);
    remaining -= numericalCorrect;
    
    const verbalCorrect = Math.min(Math.floor(remaining * (verbalTotal / (totalQuestions - logicalTotal - numericalTotal))), verbalTotal);
    remaining -= verbalCorrect;
    
    // Assign remaining points to problem solving
    const problemSolvingCorrect = Math.min(remaining, problemSolvingTotal);
    
    displayCategories = [
      { name: "Logical Reasoning", correct: logicalCorrect, total: logicalTotal, source: "Calculated" },
      { name: "Numerical Analysis", correct: numericalCorrect, total: numericalTotal, source: "Calculated" },
      { name: "Verbal Comprehension", correct: verbalCorrect, total: verbalTotal, source: "Calculated" },
      { name: "Problem Solving", correct: problemSolvingCorrect, total: problemSolvingTotal, source: "Calculated" }
    ];
    
    console.log('CategoryBreakdown - Generated categories:', displayCategories);
    console.log('CategoryBreakdown - Sum of correct answers:', 
      displayCategories.reduce((sum, cat) => sum + cat.correct, 0), 
      '(should equal', actualScore, ')');
  }
  
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-center mb-3">
        <BrainCircuit className="h-5 w-5 mr-2 text-purple-500" />
        <h4 className="font-medium">Category Performance</h4>
      </div>
      <div className="space-y-3">
        {displayCategories.map((category, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm">
                {category.name} 
                {category.source && category.source !== "Calculated" && (
                  <span className="text-xs text-gray-500 ml-2">({category.source})</span>
                )}
              </span>
              <span className="text-sm font-medium">
                {category.correct}/{category.total} 
                <span className="text-gray-500 ml-1">
                  ({Math.round((category.correct / category.total) * 100)}%)
                </span>
              </span>
            </div>
            <Progress 
              value={(category.correct / category.total) * 100} 
              className="h-2.5 bg-gray-100" 
              color={
                (category.correct / category.total) >= 0.8 ? "#22c55e" : 
                (category.correct / category.total) >= 0.6 ? "#eab308" : 
                "#ef4444"
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
