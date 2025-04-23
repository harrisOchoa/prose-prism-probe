
import React from 'react';
import { BrainCircuit } from "lucide-react";

interface CategoryHeaderProps {
  title?: string;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ 
  title = "Category Performance"
}) => {
  return (
    <div className="flex items-center mb-3">
      <BrainCircuit className="h-5 w-5 mr-2 text-purple-500" />
      <h4 className="font-medium">{title}</h4>
    </div>
  );
};

export default CategoryHeader;
