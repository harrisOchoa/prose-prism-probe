
import React from 'react';
import CategoryProgressBar from './CategoryProgressBar';

interface CategoryItemProps {
  name: string;
  correct: number;
  total: number;
  source?: string;
  showPercentage?: boolean;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ 
  name, 
  correct, 
  total, 
  source,
  showPercentage = true
}) => {
  const percentage = Math.round((correct / total) * 100);
  
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between mb-1">
        <span className="text-sm">
          {name}
          {source && source !== "System" && source !== "Calculated" && (
            <span className="text-xs text-gray-500 ml-2">({source})</span>
          )}
        </span>
        <span className="text-sm font-medium">
          {correct}/{total}
          {showPercentage && (
            <span className="text-gray-500 ml-1">
              ({percentage}%)
            </span>
          )}
        </span>
      </div>
      <CategoryProgressBar correct={correct} total={total} />
    </div>
  );
};

export default CategoryItem;
