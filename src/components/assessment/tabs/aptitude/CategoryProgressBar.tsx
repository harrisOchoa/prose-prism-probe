
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface CategoryProgressBarProps {
  correct: number;
  total: number;
}

const CategoryProgressBar: React.FC<CategoryProgressBarProps> = ({ correct, total }) => {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  // Get color based on percentage score
  const getColorByPercentage = (percent: number): string => {
    if (percent >= 80) return "#22c55e"; // green-500
    if (percent >= 60) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };
  
  return (
    <div className="relative pt-1">
      <Progress 
        value={percentage} 
        className="h-2.5"
        color={getColorByPercentage(percentage)}
      />
    </div>
  );
};

export default CategoryProgressBar;
