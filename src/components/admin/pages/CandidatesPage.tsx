
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useAdminCandidates } from "@/hooks/useAdminCandidates";

// Import our new components
import CandidatesHeader from "./candidates/CandidatesHeader";
import CandidateSearchBar from "./candidates/CandidateSearchBar";
import CandidatesGrid from "./candidates/CandidatesGrid";
import { useCandidateSorting } from "./candidates/useCandidateSorting";

const CandidatesPage = () => {
  const { candidates, loading, error, searchTerm, setSearchTerm } = useAdminCandidates();
  const { sortedCandidates } = useCandidateSorting(candidates);

  return (
    <div className="p-6 space-y-6">
      <CandidatesHeader 
        candidatesCount={candidates.length}
        loading={loading}
      />
      
      <CandidateSearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Candidate Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CandidatesGrid 
            candidates={sortedCandidates}
            loading={loading}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidatesPage;
