
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface CategoryProgressBarProps {
  correct: number;
  total: number;
}

const CategoryProgressBar: React.FC<CategoryProgressBarProps> = ({ correct, total }) => {
  const percentage = Math.round((correct / total) * 100);
  
  return (
    <Progress 
      value={percentage} 
      className="h-2.5 bg-gray-100" 
      color={
        percentage >= 80 ? "#22c55e" : 
        percentage >= 60 ? "#eab308" : 
        "#ef4444"
      }
    />
  );
};

export default CategoryProgressBar;
