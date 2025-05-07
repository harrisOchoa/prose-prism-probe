
import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface CandidatesHeaderProps {
  candidatesCount: number;
  loading: boolean;
}

const CandidatesHeader: React.FC<CandidatesHeaderProps> = ({ 
  candidatesCount, 
  loading 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold">Candidates</h1>
        <p className="text-muted-foreground">
          {loading ? 'Loading candidates...' : `${candidatesCount} candidates in the system`}
        </p>
      </div>
      
      <Button className="bg-hirescribe-primary hover:bg-hirescribe-accent transition-colors">
        <UserPlus className="mr-2 h-4 w-4" />
        Add New Candidate
      </Button>
    </div>
  );
};

export default CandidatesHeader;
