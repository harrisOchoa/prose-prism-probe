
import React from "react";
import { CandidateData } from "@/hooks/useAdminCandidates";
import CandidateCard from "./CandidateCard";
import EmptyState from "@/components/admin/dashboard/components/EmptyState";
import { Users } from "lucide-react";

interface CandidatesGridProps {
  candidates: CandidateData[];
  loading: boolean;
  error: string | null;
}

const CandidatesGrid: React.FC<CandidatesGridProps> = ({ 
  candidates, 
  loading, 
  error 
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState 
        title="Error loading candidates" 
        message={error}
        icon={<Users className="h-12 w-12 text-muted-foreground opacity-70" />}
      />
    );
  }

  if (candidates.length === 0) {
    return (
      <EmptyState 
        title="No candidates found" 
        message="There are no candidates registered in the system yet. Add your first candidate to get started."
        actionLabel="Add Candidate"
        onAction={() => {}}
        icon={<Users className="h-12 w-12 text-muted-foreground opacity-70" />}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {candidates.map((candidate) => (
        <CandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </div>
  );
};

export default CandidatesGrid;
