
import React from 'react';
import CategoryProgressBar from './CategoryProgressBar';

interface CategoryItemProps {
  name: string;
  correct: number;
  total: number;
  source?: string;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ 
  name, 
  correct, 
  total, 
  source 
}) => {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm">
          {name}
          {source && source !== "Calculated" && (
            <span className="text-xs text-gray-500 ml-2">({source})</span>
          )}
        </span>
        <span className="text-sm font-medium">
          {correct}/{total}
          <span className="text-gray-500 ml-1">
            ({Math.round((correct / total) * 100)}%)
          </span>
        </span>
      </div>
      <CategoryProgressBar correct={correct} total={total} />
    </div>
  );
};

export default CategoryItem;
