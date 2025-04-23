
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface CategoryProgressBarProps {
  correct: number;
  total: number;
}

const CategoryProgressBar: React.FC<CategoryProgressBarProps> = ({ correct, total }) => {
  const percentage = Math.round((correct / total) * 100);
  
  // Get color based on percentage score
  const getColorByPercentage = (percent: number): string => {
    if (percent >= 80) return "bg-green-500"; // High score
    if (percent >= 60) return "bg-yellow-500"; // Medium score
    return "bg-red-500"; // Low score
  };
  
  return (
    <div className="relative pt-1">
      <Progress 
        value={percentage} 
        className={`h-2.5 ${getColorByPercentage(percentage)}`}
      />
    </div>
  );
};

export default CategoryProgressBar;
