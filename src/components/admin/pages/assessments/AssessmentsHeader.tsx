
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AssessmentsHeaderProps {
  totalCount: number;
  loading: boolean;
}

const AssessmentsHeader: React.FC<AssessmentsHeaderProps> = ({ 
  totalCount, 
  loading 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold">Assessments</h1>
        <p className="text-muted-foreground">
          {loading ? 'Loading assessments...' : `${totalCount} assessment submissions`}
        </p>
      </div>
      
      <Button className="bg-hirescribe-primary hover:bg-hirescribe-accent transition-colors">
        <Plus className="mr-2 h-4 w-4" />
        Create Assessment
      </Button>
    </div>
  );
};

export default AssessmentsHeader;
