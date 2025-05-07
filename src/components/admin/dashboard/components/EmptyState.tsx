
import React from "react";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message?: string;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = "No matching assessments found",
  title = "No results found",
  actionLabel,
  onAction,
  icon = <FileSearch className="h-12 w-12 text-muted-foreground opacity-70" />
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-muted/10 rounded-lg border border-dashed border-muted">
      <div className="bg-muted/20 p-6 rounded-full mb-6 animate-pulse">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{message}</p>
      
      {actionLabel && onAction && (
        <Button 
          variant="outline" 
          onClick={onAction}
          className="hover:bg-hirescribe-primary/10"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
