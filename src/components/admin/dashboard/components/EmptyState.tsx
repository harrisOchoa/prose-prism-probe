
import React from "react";
import { FileSearch } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = "No matching assessments found" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted/30 p-4 rounded-full mb-4">
        <FileSearch className="h-8 w-8 text-muted-foreground opacity-70" />
      </div>
      <h3 className="text-lg font-medium">No results found</h3>
      <p className="text-muted-foreground mt-2 max-w-sm">{message}</p>
    </div>
  );
};

export default EmptyState;
