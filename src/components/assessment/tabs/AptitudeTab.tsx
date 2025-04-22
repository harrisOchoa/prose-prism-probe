
import React from 'react';

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ categories = [] }) => {
  // Log received categories
  console.log('Received Categories:', categories);

  // If no categories data, generate sample data with clear attribution
  const displayCategories = categories.length > 0 
    ? categories 
    : [
        { name: "Logical Reasoning", correct: 7, total: 10, source: "Sample Data" },
        { name: "Numerical Analysis", correct: 5, total: 8, source: "Sample Data" },
        { name: "Verbal Comprehension", correct: 4, total: 7, source: "Sample Data" },
        { name: "Problem Solving", correct: 4, total: 5, source: "Sample Data" }
      ];
  
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
                {category.source && <span className="text-xs text-gray-500 ml-2">(Sample Data)</span>}
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
