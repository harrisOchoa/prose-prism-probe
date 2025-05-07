
import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CandidateSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const CandidateSearchBar: React.FC<CandidateSearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search candidates..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Button variant="outline" className="flex gap-2">
        <Filter className="h-4 w-4" />
        <span>Filters</span>
      </Button>
    </div>
  );
};

export default CandidateSearchBar;
